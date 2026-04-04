<script setup>
import { computed, onMounted } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import { formatMoney } from '../lib/format'
import { useAccountsStore } from '../stores/accounts'
import { useTransactionsStore } from '../stores/transactions'
import { useDebtsStore } from '../stores/debts'
import { useInvestmentsStore } from '../stores/investments'

const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const debtsStore = useDebtsStore()
const investmentsStore = useInvestmentsStore()

onMounted(async () => {
  await Promise.all([
    accountsStore.fetchAll(),
    transactionsStore.fetchAll(),
    debtsStore.fetchAll(),
    investmentsStore.fetchAll(),
  ])
})

const cashTotal = computed(() => accountsStore.rows.reduce((acc, row) => acc + Number(row.balance || 0), 0))
const debtsTotal = computed(() => debtsStore.rows.reduce((acc, row) => acc + Number(row.balance || 0), 0))
const investmentsTotal = computed(() =>
  investmentsStore.rows.reduce((acc, row) => acc + Number(row.current_value || 0), 0),
)
const netWorth = computed(() => cashTotal.value + investmentsTotal.value - debtsTotal.value)
const balanceFlow = computed(() => transactionsStore.incomeTotal - transactionsStore.expenseTotal)
const expenseRatio = computed(() => {
  const income = Number(transactionsStore.incomeTotal || 0)
  const expense = Number(transactionsStore.expenseTotal || 0)
  if (!income) return 0
  return Number(((expense / income) * 100).toFixed(1))
})

const accountDistribution = computed(() => ({
  labels: accountsStore.rows.map((row) => row.name),
  values: accountsStore.rows.map((row) => Number(row.balance || 0)),
}))

const totalAssets = computed(() => cashTotal.value + investmentsTotal.value)
const debtCoverage = computed(() => {
  if (!debtsTotal.value) return 100
  return Number(((totalAssets.value / debtsTotal.value) * 100).toFixed(1))
})

const summaryCards = computed(() => [
  {
    title: 'Cuentas',
    value: formatMoney(cashTotal.value),
    subtitle: `${accountsStore.rows.length} activas`,
    color: 'border-[#4b5f84] bg-[#2f3b50]/60 text-[#b8c8e8]',
    icon: ['M3 7h18v10H3z', 'M3 11h18'],
  },
  {
    title: 'Ingresos',
    value: formatMoney(transactionsStore.incomeTotal),
    subtitle: 'Flujo positivo',
    color: 'border-[#2b7a5c] bg-[#1d4a39]/60 text-[#98f0c6]',
    icon: ['M12 5v14', 'M5 12h14'],
  },
  {
    title: 'Gastos',
    value: formatMoney(transactionsStore.expenseTotal),
    subtitle: `${expenseRatio.value}% de ingresos`,
    color: 'border-[#8b3d52] bg-[#57212f]/60 text-[#ffb3c7]',
    icon: ['M12 5v14', 'M5 12h14', 'M7 7l10 10'],
  },
  {
    title: 'Patrimonio',
    value: formatMoney(netWorth.value),
    subtitle: `Cobertura deuda ${debtCoverage.value}%`,
    color: 'border-[#5d5f86] bg-[#343550]/60 text-[#c9caee]',
    icon: ['M4 19h16', 'M6 15l4-4 3 3 5-6'],
  },
])

const netWorthOptions = computed(() => ({
  chart: { toolbar: { show: false }, background: 'transparent' },
  xaxis: { categories: ['Activo Neto'] },
  yaxis: {
    labels: {
      formatter: (value) => Number(value || 0).toFixed(2),
    },
  },
  theme: { mode: 'dark' },
  colors: ['#9ca9d8'],
  dataLabels: { enabled: true, formatter: (value) => Number(value || 0).toFixed(2) },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '40%',
    },
  },
  grid: { borderColor: '#3a404a' },
}))

const netWorthSeries = computed(() => [{ name: 'Patrimonio', data: [Number(netWorth.value.toFixed(2))] }])

const flowOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: { categories: ['Ingresos', 'Gastos', 'Balance'] },
  yaxis: {
    labels: {
      formatter: (value) => Number(value || 0).toFixed(2),
    },
  },
  theme: { mode: 'dark' },
  colors: ['#8ebea7', '#c9929a', '#9ca9d8'],
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '48%' } },
  grid: { borderColor: '#3a404a' },
}))

const flowSeries = computed(() => [
  {
    name: 'Flujo',
    data: [
      Number(transactionsStore.incomeTotal || 0),
      Number(transactionsStore.expenseTotal || 0),
      Number(balanceFlow.value || 0),
    ],
  },
])

const compositionOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['Cuentas', 'Inversiones', 'Deudas'],
  colors: ['#9ca9d8', '#8ebea7', '#c9929a'],
  legend: { labels: { colors: '#e9ecf3' } },
  stroke: { colors: ['#21252d'] },
  theme: { mode: 'dark' },
  dataLabels: { enabled: true },
}))

const compositionSeries = computed(() => [
  Number(cashTotal.value || 0),
  Number(investmentsTotal.value || 0),
  Number(debtsTotal.value || 0),
])

const accountsOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: { categories: accountDistribution.value.labels },
  yaxis: {
    labels: {
      formatter: (value) => Number(value || 0).toFixed(2),
    },
  },
  theme: { mode: 'dark' },
  colors: ['#9ca9d8'],
  plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#3a404a' },
}))

const accountsSeries = computed(() => [{ name: 'Saldo', data: accountDistribution.value.values }])
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Dashboard Financiero</h2>
      <span class="rounded-md border border-surfaceAlt bg-surfaceAlt/40 px-2 py-1 text-[11px] text-muted">
        Vista ejecutiva personal
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <BaseCard v-for="card in summaryCards" :key="card.title" class="border" :class="card.color">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs opacity-90">{{ card.title }}</p>
            <p class="text-lg font-semibold">{{ card.value }}</p>
            <p class="text-[11px] opacity-80">{{ card.subtitle }}</p>
          </div>
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-current/35 bg-black/10">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(path, index) in card.icon" :key="index" :d="path" />
            </svg>
          </span>
        </div>
      </BaseCard>
    </div>

    <div class="grid gap-3 xl:grid-cols-3">
      <BaseCard class="xl:col-span-1">
        <h3 class="mb-2 text-sm font-semibold">Composición Financiera</h3>
        <apexchart type="donut" height="260" :options="compositionOptions" :series="compositionSeries" />
      </BaseCard>

      <BaseCard class="xl:col-span-2">
        <h3 class="mb-2 text-sm font-semibold">Flujo de Caja</h3>
        <apexchart type="bar" height="260" :options="flowOptions" :series="flowSeries" />
      </BaseCard>
    </div>

    <div class="grid gap-3 xl:grid-cols-2">
      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Patrimonio (2 decimales)</h3>
        <apexchart type="bar" height="220" :options="netWorthOptions" :series="netWorthSeries" />
      </BaseCard>

      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Distribución por Cuenta</h3>
        <apexchart type="bar" height="220" :options="accountsOptions" :series="accountsSeries" />
      </BaseCard>
    </div>
  </section>
</template>
