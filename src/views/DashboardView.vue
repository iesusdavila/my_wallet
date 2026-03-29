<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { formatUSD } from '@/services/currency'
import BaseCard from '@/components/ui/BaseCard.vue'

const financeStore = useFinanceStore()
const authStore = useAuthStore()

const savingsYield = computed(() =>
  financeStore.savingsProducts.map((item) => {
    const yearlyReturn = item.principal * (item.annualRate / 100)
    return { ...item, yearlyReturn }
  }),
)

const categorySeries = computed(() => {
  const totals = new Map()

  financeStore.transactions
    .filter((item) => item.type === 'expense')
    .forEach((transaction) => {
      const category = financeStore.categories.find((item) => item.id === transaction.categoryId)
      const name = category?.name ?? 'Sin categoría'
      totals.set(name, (totals.get(name) ?? 0) + transaction.amount)
    })

  const labels = [...totals.keys()]
  const values = [...totals.values()]

  return {
    labels,
    values,
    hasData: values.length > 0,
  }
})

const netWorthSeries = computed(() => ({
  series: [
    {
      name: 'Patrimonio',
      data: [
        financeStore.netWorth * 0.72,
        financeStore.netWorth * 0.8,
        financeStore.netWorth * 0.88,
        financeStore.netWorth,
      ],
    },
  ],
  categories: ['Ene', 'Feb', 'Mar', 'Abr'],
}))

const chartTheme = {
  chart: { toolbar: { show: false }, background: 'transparent' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#2f343a' },
  xaxis: { labels: { style: { colors: '#9aa0a6' } } },
  yaxis: {
    labels: {
      style: { colors: '#9aa0a6' },
      formatter: (value) => Number(value).toFixed(2),
    },
  },
  legend: { labels: { colors: '#e8eaed' } },
  tooltip: {
    y: { formatter: (value) => Number(value).toFixed(2) },
  },
}

const hasAnyData = computed(
  () =>
    financeStore.accounts.length ||
    financeStore.transactions.length ||
    financeStore.debts.length ||
    financeStore.creditCards.length ||
    financeStore.investments.length,
)
</script>

<template>
  <section class="app-page">
    <div>
      <h2 class="section-title">Resumen financiero</h2>
      <p class="muted text-xs">Patrimonio, liquidez, deudas e inversión en un vistazo</p>
    </div>

    <div class="grid-cards">
      <BaseCard>
        <p class="text-xs text-muted">Patrimonio neto</p>
        <p class="mt-2 text-xl font-semibold text-text">{{ formatUSD(financeStore.netWorth, authStore.hideAmounts) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-muted">Saldo en cuentas</p>
        <p class="mt-2 text-xl font-semibold text-text">{{ formatUSD(financeStore.totalBalance, authStore.hideAmounts) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-muted">Deuda total</p>
        <p class="mt-2 text-xl font-semibold text-danger">{{ formatUSD(financeStore.totalDebts, authStore.hideAmounts) }}</p>
      </BaseCard>
      <BaseCard>
        <p class="text-xs text-muted">Valor de inversiones</p>
        <p class="mt-2 text-xl font-semibold text-success">{{ formatUSD(financeStore.totalInvestmentsValue, authStore.hideAmounts) }}</p>
      </BaseCard>
    </div>

    <BaseCard v-if="!hasAnyData">
      <h3 class="text-sm font-semibold text-text">Tu panel está listo</h3>
      <p class="mt-1 text-xs text-muted">Aún no hay datos. Comienza creando una cuenta y registrando tu primera transacción.</p>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-3 text-sm font-semibold text-text">Evolución de patrimonio</h3>
      <apexchart
        type="line"
        height="260"
        :options="{
          ...chartTheme,
          stroke: { curve: 'smooth', width: 3 },
          colors: ['#8ab4f8'],
          xaxis: { categories: netWorthSeries.categories, labels: { style: { colors: '#9aa0a6' } } },
        }"
        :series="netWorthSeries.series"
      />
    </BaseCard>

    <BaseCard>
      <h3 class="mb-3 text-sm font-semibold text-text">Gastos por categoría</h3>
      <apexchart
        v-if="categorySeries.hasData"
        type="bar"
        height="290"
        :options="{
          ...chartTheme,
          colors: ['#8ab4f8'],
          plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '45%' } },
          xaxis: { categories: categorySeries.labels, labels: { style: { colors: '#9aa0a6' } } },
        }"
        :series="[{ name: 'Gasto', data: categorySeries.values }]"
      />
      <p v-else class="text-xs text-muted">No hay gastos aún para graficar por categoría.</p>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-3 text-sm font-semibold text-text">Rentabilidad de ahorro bancario</h3>
      <div class="space-y-2">
        <div v-for="item in savingsYield" :key="item.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <p class="text-sm text-text">{{ item.name }}</p>
          <p class="text-xs text-muted">Tasa anual: {{ item.annualRate }}% · Frecuencia: {{ item.frequency }}</p>
          <p class="mt-1 text-sm text-success">Rendimiento estimado anual: {{ formatUSD(item.yearlyReturn, authStore.hideAmounts) }}</p>
        </div>
      </div>
    </BaseCard>
  </section>
</template>
