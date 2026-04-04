<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { useFixedExpensesStore } from '../stores/fixedExpenses'
import { useFixedIncomesStore } from '../stores/fixedIncomes'
import { useAllocationPlansStore } from '../stores/allocationPlans'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'

const fixedExpensesStore = useFixedExpensesStore()
const fixedIncomesStore = useFixedIncomesStore()
const allocationPlansStore = useAllocationPlansStore()
const uiStore = useUiStore()

const open = ref(false)
const entity = ref('expense')
const editing = ref(null)
const activeSection = ref('expenses')

const form = reactive({
  name: '',
  amount: 0,
  frequency: 'monthly',
  savings_percent: 20,
  monthly_expenses_percent: 60,
  investments_percent: 20,
})

const frequencyOptions = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
]

onMounted(async () => {
  await Promise.all([fixedExpensesStore.fetchAll(), fixedIncomesStore.fetchAll(), allocationPlansStore.fetchAll()])

  if (!allocationPlansStore.rows.length) {
    await allocationPlansStore.create({
      name: 'Plan principal',
      savings_percent: 20,
      monthly_expenses_percent: 60,
      investments_percent: 20,
    })
    await allocationPlansStore.fetchAll()
  }
})

const monthlyExpenses = computed(() =>
  fixedExpensesStore.rows.reduce((acc, row) => acc + Number(row.amount || 0), 0),
)

const monthlyIncomes = computed(() =>
  fixedIncomesStore.rows.reduce((acc, row) => acc + Number(row.amount || 0), 0),
)

const monthlyNet = computed(() => monthlyIncomes.value - monthlyExpenses.value)
const activePlan = computed(() => allocationPlansStore.rows[0] || null)

const suggestedDistribution = computed(() => {
  const net = Number(monthlyNet.value || 0)
  const plan = activePlan.value
  if (!plan || net <= 0) {
    return {
      savings: 0,
      monthlyExpenses: 0,
      investments: 0,
    }
  }

  return {
    savings: Number((net * (Number(plan.savings_percent || 0) / 100)).toFixed(2)),
    monthlyExpenses: Number((net * (Number(plan.monthly_expenses_percent || 0) / 100)).toFixed(2)),
    investments: Number((net * (Number(plan.investments_percent || 0) / 100)).toFixed(2)),
  }
})

function formatCompactAmount(value) {
  const num = Number(value || 0)
  const abs = Math.abs(num)

  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}k`
  return num.toFixed(0)
}

const fixedExpensesChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: {
    categories: fixedExpensesStore.rows.map((row) => row.name),
    labels: { formatter: (value) => formatCompactAmount(value) },
  },
  tooltip: { y: { formatter: (value) => formatCompactAmount(value) } },
  theme: { mode: 'dark' },
  colors: ['#c9929a'],
  plotOptions: { bar: { borderRadius: 6, horizontal: true } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#3a404a' },
}))

const fixedExpensesSeries = computed(() => [
  { name: 'Gasto fijo', data: fixedExpensesStore.rows.map((row) => Number(row.amount || 0)) },
])

const fixedIncomesChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: {
    categories: fixedIncomesStore.rows.map((row) => row.name),
    labels: { formatter: (value) => formatCompactAmount(value) },
  },
  tooltip: { y: { formatter: (value) => formatCompactAmount(value) } },
  theme: { mode: 'dark' },
  colors: ['#8ebea7'],
  plotOptions: { bar: { borderRadius: 6, horizontal: true } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#3a404a' },
}))

const fixedIncomesSeries = computed(() => [
  { name: 'Ingreso fijo', data: fixedIncomesStore.rows.map((row) => Number(row.amount || 0)) },
])

const planChartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['Ahorro', 'Operación', 'Inversión'],
  colors: ['#8ebea7', '#9ca9d8', '#c9929a'],
  legend: { labels: { colors: '#e9ecf3' } },
  stroke: { colors: ['#21252d'] },
  theme: { mode: 'dark' },
  dataLabels: { enabled: true },
}))

const planChartSeries = computed(() => [
  Number(activePlan.value?.savings_percent || 0),
  Number(activePlan.value?.monthly_expenses_percent || 0),
  Number(activePlan.value?.investments_percent || 0),
])

function resetForm() {
  form.name = ''
  form.amount = 0
  form.frequency = 'monthly'
  form.savings_percent = 20
  form.monthly_expenses_percent = 60
  form.investments_percent = 20
}

function openCreate(target) {
  entity.value = target
  editing.value = null
  resetForm()
  open.value = true
}

function openEdit(target, row) {
  entity.value = target
  editing.value = row
  form.name = row.name || ''
  form.amount = row.amount || 0
  form.frequency = row.frequency || 'monthly'
  form.savings_percent = row.savings_percent || 20
  form.monthly_expenses_percent = row.monthly_expenses_percent || 60
  form.investments_percent = row.investments_percent || 20
  open.value = true
}

function openEditPlan() {
  entity.value = 'allocation'
  editing.value = activePlan.value
  form.name = activePlan.value?.name || 'Plan principal'
  form.savings_percent = activePlan.value?.savings_percent || 20
  form.monthly_expenses_percent = activePlan.value?.monthly_expenses_percent || 60
  form.investments_percent = activePlan.value?.investments_percent || 20
  open.value = true
}

async function save() {
  try {
    if (entity.value === 'allocation') {
      const payload = {
        name: form.name || 'Plan principal',
        savings_percent: Number(form.savings_percent),
        monthly_expenses_percent: Number(form.monthly_expenses_percent),
        investments_percent: Number(form.investments_percent),
      }

      if (activePlan.value?.id) {
        await allocationPlansStore.update(activePlan.value.id, payload)
      } else {
        await allocationPlansStore.create(payload)
      }

      await allocationPlansStore.fetchAll()
      uiStore.showToast('Plan actualizado', 'success')
      open.value = false
      return
    }

    const payload = {
      name: form.name,
      amount: Number(form.amount),
      frequency: form.frequency,
    }

    const store = entity.value === 'income' ? fixedIncomesStore : fixedExpensesStore

    if (editing.value) {
      await store.update(editing.value.id, payload)
    } else {
      await store.create(payload)
    }

    uiStore.showToast('Registro guardado', 'success')
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(target, id) {
  const store = target === 'income' ? fixedIncomesStore : fixedExpensesStore
  await store.remove(id)
  uiStore.showToast('Registro eliminado', 'success')
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Planificación Mensual</h2>
      <div class="flex gap-2">
        <BaseButton aria-label="Nuevo gasto fijo" title="Nuevo gasto fijo" @click="openCreate('expense')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14M7 7l10 10" /></svg>
        </BaseButton>
        <BaseButton variant="success" aria-label="Nuevo ingreso fijo" title="Nuevo ingreso fijo" @click="openCreate('income')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <BaseCard class="border border-[#8b3d52] bg-[#57212f]/40">
        <p class="text-xs text-muted">Gastos</p>
        <p class="text-lg font-semibold text-[#ffb3c7]">{{ formatMoney(monthlyExpenses) }}</p>
      </BaseCard>
      <BaseCard class="border border-[#2b7a5c] bg-[#1d4a39]/40">
        <p class="text-xs text-muted">Ingresos</p>
        <p class="text-lg font-semibold text-[#98f0c6]">{{ formatMoney(monthlyIncomes) }}</p>
      </BaseCard>
      <BaseCard class="border border-[#5d5f86] bg-[#343550]/40">
        <p class="text-xs text-muted">Balance neto</p>
        <p class="text-lg font-semibold text-[#c9caee]">{{ formatMoney(monthlyNet) }}</p>
      </BaseCard>
      <BaseCard class="border border-[#4f7c74] bg-[#2f4541]/40">
        <p class="text-xs text-muted">Plan activo</p>
        <p class="text-sm font-semibold text-[#b7e2d5]">{{ activePlan?.name || 'Sin definir' }}</p>
      </BaseCard>
    </div>

    <BaseCard>
      <div class="flex justify-center">
        <div class="relative inline-grid grid-cols-3 rounded-full border border-surfaceAlt bg-surfaceAlt/40 p-1">
          <span
            class="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/3)] rounded-full bg-primary/25 shadow-soft transition-transform duration-200"
            :class="
              activeSection === 'expenses'
                ? 'translate-x-0'
                : activeSection === 'incomes'
                  ? 'translate-x-full'
                  : 'translate-x-[200%]'
            "
          />
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeSection === 'expenses' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeSection = 'expenses'"
          >
            Gastos
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeSection === 'incomes' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeSection = 'incomes'"
          >
            Ingresos
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeSection === 'plan' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeSection = 'plan'"
          >
            Plan
          </button>
        </div>
      </div>
    </BaseCard>

    <template v-if="activeSection === 'expenses'">
      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Distribución de gastos fijos</h3>
        <apexchart type="bar" height="220" :options="fixedExpensesChartOptions" :series="fixedExpensesSeries" />
      </BaseCard>

      <div class="grid gap-3">
        <BaseCard v-for="row in fixedExpensesStore.rows" :key="row.id" class="flex items-center justify-between gap-3 border border-[#8b3d52]/60 bg-[#57212f]/25">
          <div class="min-w-0 space-y-1">
            <p class="truncate text-sm font-medium text-text">{{ row.name }}</p>
            <p class="text-xs text-muted">Frecuencia: {{ row.frequency }}</p>
            <p class="text-sm font-semibold text-[#ffb3c7]">{{ formatMoney(row.amount) }}</p>
          </div>
          <ActionButtons @edit="openEdit('expense', row)" @delete="remove('expense', row.id)" />
        </BaseCard>
      </div>
    </template>

    <template v-else-if="activeSection === 'incomes'">
      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Distribución de ingresos fijos</h3>
        <apexchart type="bar" height="220" :options="fixedIncomesChartOptions" :series="fixedIncomesSeries" />
      </BaseCard>

      <div class="grid gap-3">
        <BaseCard v-for="row in fixedIncomesStore.rows" :key="row.id" class="flex items-center justify-between gap-3 border border-[#2b7a5c]/60 bg-[#1d4a39]/25">
          <div class="min-w-0 space-y-1">
            <p class="truncate text-sm font-medium text-text">{{ row.name }}</p>
            <p class="text-xs text-muted">Frecuencia: {{ row.frequency }}</p>
            <p class="text-sm font-semibold text-[#98f0c6]">{{ formatMoney(row.amount) }}</p>
          </div>
          <ActionButtons @edit="openEdit('income', row)" @delete="remove('income', row.id)" />
        </BaseCard>
      </div>
    </template>

    <template v-else>
      <BaseCard>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-sm font-semibold">Plan de distribución (único)</h3>
          <BaseButton @click="openEditPlan">Editar plan</BaseButton>
        </div>

        <div class="grid gap-3 lg:grid-cols-2">
          <div class="space-y-2 rounded-lg border border-surfaceAlt bg-surfaceAlt/25 p-3">
            <p class="text-sm font-medium text-text">{{ activePlan?.name || 'Plan principal' }}</p>
            <p class="text-xs text-muted">Ahorro {{ activePlan?.savings_percent || 0 }}%</p>
            <p class="text-xs text-muted">Operación {{ activePlan?.monthly_expenses_percent || 0 }}%</p>
            <p class="text-xs text-muted">Inversión {{ activePlan?.investments_percent || 0 }}%</p>

            <div class="mt-2 rounded-md border border-surfaceAlt/90 bg-surfaceAlt/30 p-2 text-xs">
              <p class="text-muted">Ahorro sugerido: <span class="text-text">{{ formatMoney(suggestedDistribution.savings) }}</span></p>
              <p class="text-muted">Operación sugerida: <span class="text-text">{{ formatMoney(suggestedDistribution.monthlyExpenses) }}</span></p>
              <p class="text-muted">Inversión sugerida: <span class="text-text">{{ formatMoney(suggestedDistribution.investments) }}</span></p>
            </div>
          </div>

          <div>
            <apexchart type="donut" height="240" :options="planChartOptions" :series="planChartSeries" />
          </div>
        </div>
      </BaseCard>
    </template>

    <BaseModal :open="open" :title="editing ? 'Editar registro' : 'Nuevo registro'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <template v-if="entity === 'expense' || entity === 'income'">
          <BaseInput v-model="form.name" :label="entity === 'expense' ? 'Gasto fijo' : 'Ingreso fijo'" required />
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="form.amount" label="Monto" type="number" step="0.01" required />
            <BaseSelect v-model="form.frequency" label="Frecuencia" :options="frequencyOptions" required />
          </div>
        </template>

        <template v-else>
          <BaseInput v-model="form.name" label="Nombre del plan" required />
          <div class="grid grid-cols-3 gap-3">
            <BaseInput v-model="form.savings_percent" label="% Ahorro" type="number" step="0.01" required />
            <BaseInput v-model="form.monthly_expenses_percent" label="% Operación" type="number" step="0.01" required />
            <BaseInput v-model="form.investments_percent" label="% Inversión" type="number" step="0.01" required />
          </div>
        </template>

        <BaseButton type="submit" block>Guardar</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
