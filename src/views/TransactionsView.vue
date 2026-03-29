<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { formatUSD } from '@/services/currency'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseDateInput from '@/components/ui/BaseDateInput.vue'
import BaseToast from '@/components/ui/BaseToast.vue'
import QuickTransactionModal from '@/components/QuickTransactionModal.vue'

const financeStore = useFinanceStore()
const authStore = useAuthStore()

const now = new Date()
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

const filters = reactive({
  flow: 'all',
  accountId: '',
  categoryId: '',
  text: '',
  from: firstDayOfMonth,
  to: lastDayOfMonth,
})

const showQuick = ref(false)
const toastMessage = ref('')
const section = ref('charts')
const showEditTransaction = ref(false)
const editTransactionForm = reactive({
  type: 'expense',
  amount: '',
  categoryId: '',
  accountId: '',
  destinationAccountId: '',
  date: '',
  description: '',
})
const editingTransactionId = ref('')

const categoryOptions = computed(() =>
  financeStore.categories
    .filter((item) => (filters.flow === 'all' ? true : item.type === filters.flow))
    .map((item) => ({ value: item.id, label: `${item.type === 'expense' ? '🔴' : '🟢'} ${item.name}` })),
)
const accountOptions = computed(() => financeStore.accounts.map((item) => ({ value: item.id, label: item.name })))

const filteredTransactions = computed(() =>
  financeStore.transactions.filter((transaction) => {
    if (filters.flow !== 'all' && transaction.type !== filters.flow) {
      return false
    }
    if (filters.accountId && transaction.accountId !== filters.accountId) {
      return false
    }
    if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
      return false
    }
    if (filters.text && !transaction.description?.toLowerCase().includes(filters.text.toLowerCase())) {
      return false
    }
    if (filters.from && transaction.date < filters.from) {
      return false
    }
    if (filters.to && transaction.date > filters.to) {
      return false
    }
    return true
  }),
)

const getCategoryName = (id) => financeStore.categories.find((item) => item.id === id)?.name ?? '-'
const getCategoryType = (id) => financeStore.categories.find((item) => item.id === id)?.type ?? ''
const getAccountName = (id) => financeStore.accounts.find((item) => item.id === id)?.name ?? '-'

const monthExpenseByCategory = computed(() => {
  const totals = new Map()
  filteredTransactions.value
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const name = getCategoryName(item.categoryId)
      totals.set(name, (totals.get(name) ?? 0) + Number(item.amount || 0))
    })

  return {
    labels: [...totals.keys()],
    values: [...totals.values()],
    hasData: totals.size > 0,
  }
})

const dailyIncomeExpense = computed(() => {
  const incomeByDay = new Map()
  const expenseByDay = new Map()

  filteredTransactions.value.forEach((item) => {
    const day = Number(item.date.slice(-2))
    if (item.type === 'income') {
      incomeByDay.set(day, (incomeByDay.get(day) ?? 0) + Number(item.amount || 0))
    }
    if (item.type === 'expense') {
      expenseByDay.set(day, (expenseByDay.get(day) ?? 0) + Number(item.amount || 0))
    }
  })

  const mergedDays = [...new Set([...incomeByDay.keys(), ...expenseByDay.keys()])].sort((a, b) => a - b)

  return {
    categories: mergedDays.map((day) => `${day}`),
    income: mergedDays.map((day) => Number((incomeByDay.get(day) ?? 0).toFixed(2))),
    expense: mergedDays.map((day) => Number((expenseByDay.get(day) ?? 0).toFixed(2))),
    hasData: mergedDays.length > 0,
  }
})

const incomeExpenseSummary = computed(() => {
  let income = 0
  let expense = 0

  filteredTransactions.value.forEach((item) => {
    if (item.type === 'income') {
      income += Number(item.amount || 0)
    }
    if (item.type === 'expense') {
      expense += Number(item.amount || 0)
    }
  })

  return {
    labels: ['Ingresos', 'Gastos'],
    values: [Number(income.toFixed(2)), Number(expense.toFixed(2))],
    hasData: income > 0 || expense > 0,
  }
})

const chartTheme = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#2f343a' },
  legend: { labels: { colors: '#e8eaed' } },
  xaxis: { labels: { style: { colors: '#9aa0a6' } } },
  yaxis: { labels: { style: { colors: '#9aa0a6' } } },
  tooltip: {
    y: { formatter: (value) => Number(value).toFixed(2) },
  },
}

const notify = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 2200)
}

const editTransaction = (transaction) => {
  editingTransactionId.value = transaction.id
  editTransactionForm.type = transaction.type
  editTransactionForm.amount = String(transaction.amount ?? 0)
  editTransactionForm.categoryId = transaction.categoryId || ''
  editTransactionForm.accountId = transaction.accountId || ''
  editTransactionForm.destinationAccountId = transaction.destinationAccountId || ''
  editTransactionForm.date = transaction.date
  editTransactionForm.description = transaction.description || ''
  showEditTransaction.value = true
}

const closeEditTransaction = () => {
  showEditTransaction.value = false
  editingTransactionId.value = ''
}

const saveEditTransaction = (payload) => {
  if (!editingTransactionId.value || !payload?.amount || Number(payload.amount) <= 0) {
    return
  }

  financeStore.updateTransaction(editingTransactionId.value, {
    type: payload.type,
    amount: Number(payload.amount),
    categoryId: payload.type === 'transfer' ? null : payload.categoryId,
    accountId: payload.accountId,
    destinationAccountId: payload.type === 'transfer' ? payload.destinationAccountId : null,
    date: payload.date,
    description: payload.description,
  })

  closeEditTransaction()
  notify('Transacción actualizada')
}

const deleteTransaction = (id) => {
  financeStore.deleteTransaction(id)
  notify('Transacción eliminada')
}

</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h2 class="section-title">Transacciones</h2>
        <p class="muted text-xs">Con filtros por mes actual y panel de gráficas</p>
      </div>
      <BaseButton size="sm" @click="showQuick = true">+ Movimiento</BaseButton>
    </div>

    <div class="grid grid-cols-2 gap-2 md:w-fit">
      <BaseButton :variant="section === 'charts' ? 'primary' : 'secondary'" size="sm" @click="section = 'charts'">Gráficas</BaseButton>
      <BaseButton :variant="section === 'detail' ? 'primary' : 'secondary'" size="sm" @click="section = 'detail'">Detalle</BaseButton>
    </div>

    <BaseCard class="space-y-3">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
        <BaseSelect
          v-model="filters.flow"
          label="Vista"
          :options="[
            { value: 'all', label: 'Todos' },
            { value: 'expense', label: 'Gastos' },
            { value: 'income', label: 'Ingresos' },
          ]"
        />
        <BaseSelect v-model="filters.accountId" label="Cuenta" :options="accountOptions" />
        <BaseSelect v-model="filters.categoryId" label="Categoría" :options="categoryOptions" />
        <BaseInput v-model="filters.text" label="Buscar" placeholder="Descripción" />
      </div>

      <div class="grid grid-cols-2 gap-2 md:max-w-md">
        <BaseInput v-model="filters.from" type="date" label="Desde" />
        <BaseInput v-model="filters.to" type="date" label="Hasta" />
      </div>
    </BaseCard>

    <div v-if="section === 'charts'" class="space-y-3">
      <BaseCard>
        <h3 class="mb-3 text-sm font-semibold text-text">Ingresos vs gastos (período)</h3>
        <apexchart
          v-if="incomeExpenseSummary.hasData"
          type="bar"
          height="260"
          :options="{
            ...chartTheme,
            colors: ['#81c995', '#f28b82'],
            plotOptions: { bar: { borderRadius: 8, columnWidth: '45%', distributed: true } },
            xaxis: { categories: incomeExpenseSummary.labels, labels: { style: { colors: '#9aa0a6' } } },
            yaxis: {
              labels: {
                style: { colors: '#9aa0a6' },
                formatter: (value) => Number(value).toFixed(2),
              },
            },
          }"
          :series="[{ name: 'Monto', data: incomeExpenseSummary.values }]"
        />
        <p v-else class="text-xs text-muted">No hay ingresos ni gastos para el período filtrado.</p>
      </BaseCard>

      <BaseCard>
        <h3 class="mb-3 text-sm font-semibold text-text">Gastos por categoría (mes actual)</h3>
        <apexchart
          v-if="monthExpenseByCategory.hasData"
          type="bar"
          height="290"
          :options="{
            ...chartTheme,
            colors: ['#f28b82'],
            plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '45%' } },
            xaxis: { categories: monthExpenseByCategory.labels, labels: { style: { colors: '#9aa0a6' } } },
            yaxis: { labels: { style: { colors: '#9aa0a6' } } },
          }"
          :series="[{ name: 'Gasto', data: monthExpenseByCategory.values }]"
        />
        <p v-else class="text-xs text-muted">No hay gastos para el período filtrado.</p>
      </BaseCard>

      <BaseCard>
        <h3 class="mb-3 text-sm font-semibold text-text">Ingresos y gastos por día</h3>
        <apexchart
          v-if="dailyIncomeExpense.hasData"
          type="line"
          height="300"
          :options="{
            ...chartTheme,
            stroke: { curve: 'smooth', width: 3 },
            colors: ['#81c995', '#f28b82'],
            xaxis: { categories: dailyIncomeExpense.categories, labels: { style: { colors: '#9aa0a6' } } },
            yaxis: {
              labels: {
                style: { colors: '#9aa0a6' },
                formatter: (value) => Number(value).toFixed(2),
              },
            },
          }"
          :series="[
            { name: 'Ingresos', data: dailyIncomeExpense.income },
            { name: 'Gastos', data: dailyIncomeExpense.expense },
          ]"
        />
        <p v-else class="text-xs text-muted">No hay ingresos o gastos diarios para el período filtrado.</p>
      </BaseCard>
    </div>

    <div v-else-if="filteredTransactions.length" class="space-y-2">
      <BaseCard v-for="transaction in filteredTransactions" :key="transaction.id">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-text">{{ transaction.date }}</span>
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :class="transaction.type === 'income' ? 'bg-success/20 text-success' : transaction.type === 'expense' ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'"
              >
                {{ transaction.type === 'income' ? 'Ingreso' : transaction.type === 'expense' ? 'Gasto' : 'Transferencia' }}
              </span>
            </div>
            <div class="flex gap-1">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="editTransaction(transaction)"
                :title="'Editar transacción'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="deleteTransaction(transaction.id)"
                :title="'Eliminar transacción'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <p class="text-sm text-text">{{ transaction.description || 'Sin descripción' }}</p>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted">{{ getAccountName(transaction.accountId) }}</span>
              <span v-if="transaction.type === 'transfer'" class="text-xs text-muted">→ {{ getAccountName(transaction.destinationAccountId) }}</span>
              <span
                v-if="transaction.type !== 'transfer'"
                class="inline-flex rounded-lg border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                {{ getCategoryName(transaction.categoryId) }}
              </span>
            </div>
            <p
              class="text-lg font-semibold"
              :class="transaction.type === 'income' ? 'text-success' : transaction.type === 'expense' ? 'text-danger' : 'text-primary'"
            >
              {{
                transaction.type === 'expense'
                  ? `-${formatUSD(transaction.amount, authStore.hideAmounts)}`
                  : formatUSD(transaction.amount, authStore.hideAmounts)
              }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-else>
      <p class="text-sm text-text">No hay transacciones para los filtros aplicados.</p>
      <p class="mt-1 text-xs text-muted">Crea tu primer movimiento con el botón “+ Movimiento”.</p>
    </BaseCard>

    <QuickTransactionModal
      :open="showQuick"
      @close="showQuick = false"
      @saved="notify('Movimiento guardado')"
    />

    <QuickTransactionModal
      :open="showEditTransaction"
      mode="edit"
      title="Editar transacción"
      submit-label="Guardar cambios"
      :fixed-type="true"
      :initial-values="editTransactionForm"
      @close="closeEditTransaction"
      @saved="saveEditTransaction"
    />

    <BaseToast :visible="Boolean(toastMessage)" :message="toastMessage" />
  </section>
</template>
