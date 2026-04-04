<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { useLoansStore } from '../stores/loans'
import { useAccountsStore } from '../stores/accounts'
import { useCategoriesStore } from '../stores/categories'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'

const loansStore = useLoansStore()
const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()
const uiStore = useUiStore()
const PAYMENT_DATES_KEY = 'wallet_loans_paid_dates_v1'

const open = ref(false)
const editing = ref(null)
const filter = ref('all')

const form = reactive({
  person: '',
  amount: 0,
  description: '',
  paid: false,
})

const settlement = reactive({
  accountId: '',
})

const accountOptions = computed(() => accountsStore.rows.map((row) => ({ value: row.id, label: row.name })))
const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagados' },
  { value: 'pending', label: 'Pendientes' },
]

const stats = computed(() => ({
  all: loansStore.rows.length,
  paid: loansStore.rows.filter((row) => row.paid).length,
  pending: loansStore.rows.filter((row) => !row.paid).length,
}))

const visibleRows = computed(() => {
  if (filter.value === 'paid') return loansStore.rows.filter((row) => row.paid)
  if (filter.value === 'pending') return loansStore.rows.filter((row) => !row.paid)
  return loansStore.rows
})

const totalVisible = computed(() =>
  visibleRows.value.reduce((acc, row) => acc + Number(row.amount || 0), 0),
)

onMounted(async () => {
  await Promise.all([loansStore.fetchAll(), accountsStore.fetchAll(), categoriesStore.fetchAll()])
  settlement.accountId = accountOptions.value[0]?.value || ''
})

function openCreate() {
  editing.value = null
  form.person = ''
  form.amount = 0
  form.description = ''
  form.paid = false
  open.value = true
}

function openEdit(row) {
  editing.value = row
  Object.assign(form, row)
  open.value = true
}

function readPaymentDates() {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_DATES_KEY) || '{}')
  } catch {
    return {}
  }
}

function setPaymentDate(loanId, date) {
  const map = readPaymentDates()
  map[loanId] = date
  localStorage.setItem(PAYMENT_DATES_KEY, JSON.stringify(map))
}

function getPaymentDate(loanId) {
  const map = readPaymentDates()
  return map[loanId] || null
}

async function save() {
  try {
    const payload = {
      person: form.person,
      amount: Number(form.amount),
      description: form.description,
      paid: Boolean(form.paid),
    }
    if (editing.value) {
      await loansStore.update(editing.value.id, payload)
    } else {
      await loansStore.create(payload)
    }
    uiStore.showToast('Préstamo guardado', 'success')
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(id) {
  await loansStore.remove(id)
  uiStore.showToast('Préstamo eliminado', 'success')
}

async function markAsPaid(row) {
  const defaultIncomeCategoryId = categoriesStore.rows.find((category) => category.type === 'income')?.id

  if (!settlement.accountId || !defaultIncomeCategoryId) {
    uiStore.showToast('Necesitas cuenta y al menos una categoría de ingreso', 'error')
    return
  }

  try {
    await loansStore.markAsPaid({
      loan: row,
      accountId: settlement.accountId,
      categoryId: defaultIncomeCategoryId,
    })
    setPaymentDate(row.id, new Date().toISOString().slice(0, 10))
    uiStore.showToast('Marcado como pagado y registrado como ingreso', 'success')
    await loansStore.fetchAll()
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

function statusChipClass(isPaid) {
  return isPaid
    ? 'bg-[#1d4a39] text-[#98f0c6] border-[#2b7a5c]'
    : 'bg-[#5b4521] text-[#ffd493] border-[#8e6d36]'
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Préstamos</h2>
      <BaseButton aria-label="Nuevo préstamo" title="Nuevo préstamo" @click="openCreate">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </BaseButton>
    </div>

    <BaseCard>
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Filtros</p>
        <p class="text-xs text-muted">Total visible: {{ formatMoney(totalVisible) }}</p>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-3">
        <BaseSelect v-model="filter" label="Estado" :options="filterOptions" />
        <div class="rounded-xl border border-surfaceAlt bg-surfaceAlt/25 px-3 py-2.5 text-xs text-muted">
          <p>Todos: {{ stats.all }}</p>
          <p>Pagados: {{ stats.paid }} · Pendientes: {{ stats.pending }}</p>
        </div>
      </div>

      <p class="mb-2 mt-4 text-xs text-muted"></p>
      <div class="grid gap-3 grid-cols-1">
        <BaseSelect v-model="settlement.accountId" label="Cuenta de ingreso" :options="accountOptions" />
      </div>
    </BaseCard>

    <div class="grid gap-3">
      <BaseCard v-for="row in visibleRows" :key="row.id" class="flex items-center justify-between gap-3">
        <div class="min-w-0 space-y-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex rounded-md border px-2 py-1 text-[11px] font-medium" :class="statusChipClass(row.paid)">
              {{ row.paid ? 'Pagado' : 'Pendiente' }}
            </span>
            <p class="truncate text-sm font-medium text-text">{{ row.person }}</p>
          </div>

          <div class="text-sm font-semibold text-text">{{ formatMoney(row.amount) }}</div>

          <p class="text-xs text-muted">{{ row.description || 'Sin descripción' }}</p>

          <p v-if="row.paid && getPaymentDate(row.id)" class="text-[11px] text-muted">
            Fecha de pago: {{ getPaymentDate(row.id) }}
          </p>
        </div>
        <ActionButtons :show-paid="!row.paid" @edit="openEdit(row)" @delete="remove(row.id)" @paid="markAsPaid(row)" />
      </BaseCard>

      <BaseCard v-if="visibleRows.length === 0" class="text-center text-sm text-muted">
        No hay préstamos para este filtro.
      </BaseCard>
    </div>

    <BaseModal :open="open" :title="editing ? 'Editar préstamo' : 'Nuevo préstamo'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="form.person" label="Persona" required />
          <BaseInput v-model="form.amount" label="Monto" type="number" step="0.01" required />
        </div>
        <BaseInput v-model="form.description" label="Descripción" />

        <div class="rounded-xl border border-surfaceAlt bg-surfaceAlt/30 p-3">
          <p class="mb-2 text-[10px] uppercase tracking-[0.08em] text-muted">Vista previa</p>
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-text">{{ form.person || 'Persona' }}</span>
            <span class="text-sm font-semibold text-text">{{ formatMoney(form.amount) }}</span>
          </div>
        </div>

        <BaseButton type="submit" block>Guardar</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
