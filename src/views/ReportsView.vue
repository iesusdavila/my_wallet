<script setup>
import { computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { exportTransactionsToExcel } from '@/services/export'
import { formatUSD } from '@/services/currency'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()

const filters = reactive({
  from: '',
  to: '',
})

const chartTheme = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#2f343a' },
  xaxis: { labels: { style: { colors: '#9aa0a6' } } },
  yaxis: { labels: { style: { colors: '#9aa0a6' } } },
}

const reportTransactions = computed(() =>
  financeStore.transactions.filter((item) => {
    if (filters.from && item.date < filters.from) {
      return false
    }
    if (filters.to && item.date > filters.to) {
      return false
    }
    return true
  }),
)

const monthlySeries = computed(() => {
  const map = new Map()

  reportTransactions.value.forEach((transaction) => {
    const month = transaction.date.slice(0, 7)
    const values = map.get(month) ?? { income: 0, expense: 0 }
    if (transaction.type === 'income') {
      values.income += transaction.amount
    }
    if (transaction.type === 'expense') {
      values.expense += transaction.amount
    }
    map.set(month, values)
  })

  const months = [...map.keys()].sort()

  return {
    categories: months,
    series: [
      { name: 'Ingresos', data: months.map((month) => map.get(month)?.income ?? 0) },
      { name: 'Gastos', data: months.map((month) => map.get(month)?.expense ?? 0) },
    ],
  }
})

const pendingDebtByType = computed(() => {
  const debt = financeStore.debts.reduce((sum, item) => sum + item.balance, 0)
  const cards = financeStore.creditCards.reduce((sum, item) => sum + item.outstanding, 0)
  return [debt, cards]
})

const investmentPerformance = computed(() =>
  financeStore.investments.map((item) => item.currentValue - (item.contributions - item.withdrawals)),
)

const exportExcel = () => {
  const rows = reportTransactions.value.map((item) => {
    const category = financeStore.categories.find((value) => value.id === item.categoryId)?.name
    const account = financeStore.accounts.find((value) => value.id === item.accountId)?.name

    return {
      ...item,
      categoryName: category,
      accountName: account,
    }
  })

  exportTransactionsToExcel(rows)
}
</script>

<template>
  <section class="app-page">
    <div>
      <h2 class="section-title">Reportes y exportación</h2>
      <p class="muted text-xs">Período custom, gráficos clave y exportación Excel</p>
    </div>

    <BaseCard class="space-y-3">
      <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
        <BaseInput v-model="filters.from" type="date" label="Desde" />
        <BaseInput v-model="filters.to" type="date" label="Hasta" />
        <div class="flex items-end">
          <BaseButton block @click="exportExcel">Exportar a Excel</BaseButton>
        </div>
      </div>
      <p class="text-xs text-muted">Movimientos en período: {{ reportTransactions.length }}</p>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Ingresos vs Gastos por mes</h3>
      <apexchart
        type="bar"
        height="280"
        :options="{ ...chartTheme, colors: ['#81c995', '#f28b82'], xaxis: { categories: monthlySeries.categories } }"
        :series="monthlySeries.series"
      />
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Deuda pendiente por tipo</h3>
      <apexchart
        type="donut"
        height="260"
        :options="{ labels: ['Préstamos', 'Tarjetas'], colors: ['#fdd663', '#f28b82'], legend: { labels: { colors: '#e8eaed' } } }"
        :series="pendingDebtByType"
      />
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Rendimiento de inversiones</h3>
      <apexchart
        type="bar"
        height="260"
        :options="{ ...chartTheme, colors: ['#8ab4f8'], xaxis: { categories: financeStore.investments.map((item) => item.name) } }"
        :series="[{ name: 'Rendimiento', data: investmentPerformance }]"
      />
      <p class="mt-2 text-xs text-muted">
        Valor total inversiones: {{ formatUSD(financeStore.totalInvestmentsValue, authStore.hideAmounts) }}
      </p>
    </BaseCard>
  </section>
</template>
