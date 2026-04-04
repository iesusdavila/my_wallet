<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import * as XLSX from 'xlsx'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseDateInput from '../components/base/BaseDateInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import { useTransactionsStore } from '../stores/transactions'
import { useAccountsStore } from '../stores/accounts'
import { useCategoriesStore } from '../stores/categories'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'
import { getCategoryColorClass, getCategoryIcon } from '../lib/categoryIcons'

const transactionsStore = useTransactionsStore()
const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUiStore()

const activeTab = ref('detail')
const today = new Date()
const startDate = ref(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10))
const endDate = ref(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10))
const selectedType = ref('all')
const selectedAccountId = ref('')
const selectedCategoryId = ref('')
const open = ref(false)
const editing = ref(null)

const form = reactive({
  type: 'expense',
  amount: 0,
  category_id: '',
  account_id: '',
  destination_account_id: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
})

const typeOptions = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
  { value: 'transfer', label: 'Transferencia' },
]

const quickOptions = [
  { value: 'all', label: 'Todo' },
  { value: 'expense', label: 'Gastos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'transfer', label: 'Transferencias' },
]

const accountOptions = computed(() => accountsStore.rows.map((row) => ({ value: row.id, label: row.name })))

const filterCategoryOptions = computed(() => {
  if (selectedType.value === 'transfer') return []
  if (selectedType.value === 'all') {
    return categoriesStore.rows.map((row) => ({ value: row.id, label: row.name }))
  }
  return categoriesStore.rows
    .filter((row) => row.type === selectedType.value)
    .map((row) => ({ value: row.id, label: row.name }))
})

const categoryOptions = computed(() => {
  if (form.type === 'transfer') return []
  return categoriesStore.rows
    .filter((row) => row.type === form.type)
    .map((row) => ({ value: row.id, label: row.name }))
})

const incomeExpenseSeries = computed(() => [
  {
    name: 'Monto',
    data: [Number(transactionsStore.incomeTotal || 0), Number(transactionsStore.expenseTotal || 0)],
  },
])

const incomeExpenseOptions = {
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: { categories: ['Ingresos', 'Gastos'] },
  yaxis: {
    labels: {
      formatter: (value) => String(Number(value || 0).toFixed(2)),
    },
  },
  dataLabels: { enabled: false },
  theme: { mode: 'dark' },
  colors: ['#81c995'],
  grid: { borderColor: '#35373a' },
}

const expenseByCategory = computed(() => {
  const map = new Map()
  transactionsStore.rows
    .filter((row) => row.type === 'expense')
    .forEach((row) => {
      const category = row.categories?.name || 'Sin categoría'
      map.set(category, (map.get(category) || 0) + Number(row.amount || 0))
    })

  return {
    labels: Array.from(map.keys()),
    values: Array.from(map.values()),
  }
})

const expenseByCategorySeries = computed(() => [{ name: 'Gasto', data: expenseByCategory.value.values }])
const expenseByCategoryOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  xaxis: { categories: expenseByCategory.value.labels },
  yaxis: {
    labels: {
      formatter: (value) => String(Number(value || 0).toFixed(2)),
    },
  },
  dataLabels: { enabled: false },
  theme: { mode: 'dark' },
  colors: ['#f28b82'],
  grid: { borderColor: '#35373a' },
}))

async function load() {
  await transactionsStore.fetchAll({
    startDate: startDate.value,
    endDate: endDate.value,
    type: selectedType.value,
    accountId: selectedAccountId.value,
    categoryId: selectedCategoryId.value,
  })
}

onMounted(async () => {
  await Promise.all([accountsStore.fetchAll(), categoriesStore.fetchAll()])
  form.account_id = accountOptions.value[0]?.value || ''
  await load()
})

watch([startDate, endDate, selectedType, selectedAccountId, selectedCategoryId], load)
watch(selectedType, () => {
  if (selectedType.value === 'transfer') {
    selectedCategoryId.value = ''
  }
})

function resetForm() {
  form.type = 'expense'
  form.amount = 0
  form.category_id = ''
  form.account_id = accountOptions.value[0]?.value || ''
  form.destination_account_id = ''
  form.date = new Date().toISOString().slice(0, 10)
  form.description = ''
}

function openCreate(type = 'expense') {
  editing.value = null
  resetForm()
  form.type = type
  if (type === 'income') {
    form.category_id = categoriesStore.rows.find((row) => row.type === 'income')?.id || ''
  } else if (type === 'expense') {
    form.category_id = categoriesStore.rows.find((row) => row.type === 'expense')?.id || ''
  }
  open.value = true
}

function openEdit(row) {
  editing.value = row
  form.type = row.type
  form.amount = row.amount
  form.category_id = row.category_id || ''
  form.account_id = row.account_id
  form.destination_account_id = row.destination_account_id || ''
  form.date = row.date
  form.description = row.description || ''
  open.value = true
}

async function save() {
  try {
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      category_id: form.type === 'transfer' ? null : form.category_id || null,
      account_id: form.account_id,
      destination_account_id: form.type === 'transfer' ? form.destination_account_id : null,
      date: form.date,
      description: form.description,
    }

    if (editing.value) {
      await transactionsStore.update(editing.value.id, payload)
      uiStore.showToast('Transacción actualizada', 'success')
    } else {
      await transactionsStore.create(payload)
      uiStore.showToast('Transacción creada', 'success')
    }

    open.value = false
    await load()
    await accountsStore.fetchAll()
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(id) {
  try {
    await transactionsStore.remove(id)
    uiStore.showToast('Transacción eliminada', 'success')
    await load()
    await accountsStore.fetchAll()
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

function exportExcel() {
  const rows = transactionsStore.rows.map((row) => ({
    Fecha: row.date,
    Tipo: row.type,
    Monto: Number(row.amount),
    Categoria: row.categories?.name || '',
    Cuenta: row.account?.name || '',
    Notas: row.description || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones')
  XLSX.writeFile(workbook, `transacciones_${startDate.value}_${endDate.value}.xlsx`)
}

function typeChipClass(type) {
  if (type === 'income') return 'bg-[#1d4a39] text-[#98f0c6] border-[#2b7a5c]'
  if (type === 'expense') return 'bg-[#57212f] text-[#ffb3c7] border-[#8b3d52]'
  return 'bg-primary/20 text-primary border-primary/35'
}

function typeLabel(type) {
  if (type === 'income') return 'ingreso'
  if (type === 'expense') return 'gasto'
  if (type === 'transfer') return 'transferencia'
  return type
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="section-title">Transacciones</h2>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="danger" aria-label="Crear gasto" title="Crear gasto" @click="openCreate('expense')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
            <path d="M7 7l10 10" />
          </svg>
        </BaseButton>
        <BaseButton variant="success" aria-label="Crear ingreso" title="Crear ingreso" @click="openCreate('income')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </BaseButton>
        <BaseButton variant="primary" aria-label="Exportar valores" title="Exportar valores" @click="exportExcel">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M4 19h16" />
          </svg>
        </BaseButton>
      </div>
    </div>

    <BaseCard class="[&_.form-control]:text-xs [&_.form-label]:text-[10px]">
      <h3 class="mb-3 text-sm font-semibold">Filtros</h3>
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="form-label">Inicio</span>
          <div class="relative">
            <input v-model="startDate" type="date" class="form-control pr-10" />
            <svg viewBox="0 0 24 24" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 6h14v15H5z" />
            </svg>
          </div>
        </label>
        <label class="block">
          <span class="form-label">Fin</span>
          <div class="relative">
            <input v-model="endDate" type="date" class="form-control pr-10" />
            <svg viewBox="0 0 24 24" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 6h14v15H5z" />
            </svg>
          </div>
        </label>
      </div>

      <div class="mt-3 grid grid-cols-3 gap-3">
        <BaseSelect v-model="selectedType" label="Tipo" :options="quickOptions" />
        <BaseSelect v-model="selectedAccountId" label="Cuenta" :options="[{ value: '', label: 'Todas' }, ...accountOptions]" />
        <BaseSelect
          v-model="selectedCategoryId"
          label="Categoría"
          :disabled="selectedType === 'transfer'"
          :options="[{ value: '', label: 'Todas' }, ...filterCategoryOptions]"
        />
      </div>

      <div class="mt-4 flex justify-center">
        <div class="relative inline-grid grid-cols-2 rounded-full border border-surfaceAlt bg-surfaceAlt/40 p-1">
          <span
            class="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-primary/25 shadow-soft transition-transform duration-200"
            :class="activeTab === 'detail' ? 'translate-x-full' : 'translate-x-0'"
          />
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeTab === 'graphs' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeTab = 'graphs'"
          >
            Gráfica
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeTab === 'detail' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeTab = 'detail'"
          >
            Detalle
          </button>
        </div>
      </div>
    </BaseCard>

    <template v-if="activeTab === 'graphs'">
      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Ingresos vs Gastos</h3>
        <apexchart type="bar" height="260" :options="incomeExpenseOptions" :series="incomeExpenseSeries" />
      </BaseCard>
      <BaseCard>
        <h3 class="mb-2 text-sm font-semibold">Gastos por Categoría</h3>
        <apexchart type="bar" height="260" :options="expenseByCategoryOptions" :series="expenseByCategorySeries" />
      </BaseCard>
    </template>

    <template v-else>
      <div class="grid gap-3">
        <BaseCard v-for="row in transactionsStore.rows" :key="row.id">
          <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div class="text-muted">
              <p class="mt-1 text-text">{{ row.date }}</p>
            </div>

            <div class="text-right">
              <span class="mt-1 inline-flex rounded-md border px-2 py-1 uppercase" :class="typeChipClass(row.type)">
                {{ typeLabel(row.type) }}
              </span>
            </div>

            <div>
              <span
                class="mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1"
                :class="getCategoryColorClass({ id: row.category_id, type: row.categories?.type })"
              >
                <span>{{ row.categories?.name || 'Sin categoría' }}</span>
                <span class="text-muted">|</span>
                <svg
                  viewBox="0 0 24 24"
                  class="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    v-for="(path, index) in getCategoryIcon({ id: row.category_id, name: row.categories?.name, type: row.categories?.type }).paths"
                    :key="index"
                    :d="path"
                  />
                </svg>
              </span>
            </div>

            <div class="text-right">
              <p class="mt-1 text-sm font-semibold text-text">{{ formatMoney(row.amount) }}</p>
            </div>

            <div class="text-muted">
              <p class="mt-1 text-text">{{ row.account?.name || '-' }}</p>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-primary/40 bg-primary/15 p-2 text-primary transition hover:bg-primary/25"
                aria-label="Editar"
                @click="openEdit(row)"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </button>
              <button
                type="button"
                class="rounded-lg border border-danger/45 bg-danger/15 p-2 text-danger transition hover:bg-danger/25"
                aria-label="Eliminar"
                @click="remove(row.id)"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>

            <div v-if="row.description && row.description.trim().length > 0" class="col-span-2 text-muted">
              <p class="mt-1 rounded-md border border-surfaceAlt/90 bg-surfaceAlt/40 px-2 py-1.5 text-text">
                {{ row.description }}
              </p>
            </div>
          </div>
        </BaseCard>
      </div>
    </template>

    <BaseModal :open="open" :title="editing ? 'Modificar transacción' : 'Nueva transacción'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <BaseSelect
          v-model="form.type"
          label="Tipo"
          :options="typeOptions"
          :disabled="Boolean(editing)"
          required
        />
        <BaseInput v-model="form.amount" label="Monto" type="number" step="0.01" required />
        <BaseSelect v-model="form.account_id" label="Cuenta" :options="accountOptions" required />
        <BaseSelect v-if="form.type !== 'transfer'" v-model="form.category_id" label="Categoría" :options="categoryOptions" required />
        <BaseSelect
          v-if="form.type === 'transfer'"
          v-model="form.destination_account_id"
          label="Cuenta destino"
          :options="accountOptions"
          required
        />
        <BaseDateInput v-model="form.date" label="Fecha" required />
        <BaseInput v-model="form.description" label="Descripción / Notas" />
        <BaseButton type="submit" block>{{ editing ? 'Guardar cambios' : 'Crear transacción' }}</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
