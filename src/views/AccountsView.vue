<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { useAccountsStore } from '../stores/accounts'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'

const accountsStore = useAccountsStore()
const uiStore = useUiStore()

const open = ref(false)
const editing = ref(null)
const filter = ref('all')

const form = reactive({
  name: '',
  type: 'bank',
  balance: 0,
})

const typeOptions = [
  { value: 'bank', label: 'Banco' },
  { value: 'wallet', label: 'Billetera virtual' },
]

const stats = computed(() => ({
  all: accountsStore.rows.length,
  bank: accountsStore.rows.filter((row) => row.type === 'bank').length,
  wallet: accountsStore.rows.filter((row) => row.type === 'wallet').length,
}))

const visibleRows = computed(() => {
  if (filter.value === 'all') return accountsStore.rows
  return accountsStore.rows.filter((row) => row.type === filter.value)
})

const totalBalance = computed(() =>
  visibleRows.value.reduce((acc, row) => acc + Number(row.balance || 0), 0),
)

onMounted(() => accountsStore.fetchAll())

function resetForm() {
  form.name = ''
  form.type = 'bank'
  form.balance = 0
}

function openCreate() {
  editing.value = null
  resetForm()
  open.value = true
}

function openEdit(row) {
  editing.value = row
  form.name = row.name
  form.type = row.type
  form.balance = row.balance
  open.value = true
}

async function save() {
  try {
    if (editing.value) {
      await accountsStore.update(editing.value.id, { ...form, balance: Number(form.balance) })
      uiStore.showToast('Cuenta actualizada', 'success')
    } else {
      await accountsStore.create({ ...form, balance: Number(form.balance) })
      uiStore.showToast('Cuenta creada', 'success')
    }
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(id) {
  try {
    await accountsStore.remove(id)
    uiStore.showToast('Cuenta eliminada', 'success')
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

function typeLabel(type) {
  if (type === 'bank') return 'Banco'
  if (type === 'wallet') return 'Billetera'
  return 'Cuenta'
}

function typeChipClass(type) {
  if (type === 'bank') return 'bg-[#2f3b50] text-[#b8c8e8] border-[#4b5f84]'
  if (type === 'wallet') return 'bg-[#3d3448] text-[#d7bfe8] border-[#6e5a84]'
  return 'bg-[#334238] text-[#c3e0c8] border-[#587662]'
}

function accountIcon(type) {
  if (type === 'bank') return ['M4 10h16', 'M6 10v8', 'M10 10v8', 'M14 10v8', 'M18 10v8', 'M3 18h18', 'M3 8l9-4 9 4']
  if (type === 'wallet') return ['M3 8h18v10H3z', 'M15 13h5', 'M17 13a1 1 0 1 0 0 .01']
  return ['M4 8h16v8H4z', 'M8 12h8', 'M12 8v8']
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Cuentas</h2>
      <BaseButton aria-label="Nueva cuenta" title="Nueva cuenta" @click="openCreate">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </BaseButton>
    </div>

    <BaseCard>
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Filtros</p>
        <p class="text-xs text-muted">Saldo total: {{ formatMoney(totalBalance) }}</p>
      </div>

      <div class="mt-3 flex justify-center">
        <div class="relative inline-grid grid-cols-3 rounded-full border border-surfaceAlt bg-surfaceAlt/40 p-1">
          <span
            class="absolute top-1 h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/3)] rounded-full bg-primary/25 shadow-soft transition-transform duration-200"
            :class="
              filter === 'all'
                ? 'translate-x-0 left-1'
                : filter === 'bank'
                  ? 'left-1 translate-x-full'
                  : 'left-1 translate-x-[200%]'
            "
          />

          <button
            type="button"
            class="relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition"
            :class="filter === 'all' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'all'"
          >
            Todas ({{ stats.all }})
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition"
            :class="filter === 'bank' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'bank'"
          >
            Banco ({{ stats.bank }})
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition"
            :class="filter === 'wallet' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'wallet'"
          >
            Billetera ({{ stats.wallet }})
          </button>
        </div>
      </div>
    </BaseCard>

    <div class="grid gap-3">
      <BaseCard v-for="row in visibleRows" :key="row.id" class="flex items-center justify-between gap-3">
        <div class="min-w-0 space-y-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border" :class="typeChipClass(row.type)">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(path, index) in accountIcon(row.type)" :key="index" :d="path" />
              </svg>
            </span>
            <p class="truncate text-sm font-medium text-text">{{ row.name }}</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="inline-flex rounded-md border px-2 py-1 text-[11px] font-medium" :class="typeChipClass(row.type)">
              {{ typeLabel(row.type) }}
            </span>
            <span class="text-sm font-semibold text-text">{{ formatMoney(row.balance) }}</span>
          </div>
        </div>
        <ActionButtons @edit="openEdit(row)" @delete="remove(row.id)" />
      </BaseCard>

      <BaseCard v-if="visibleRows.length === 0" class="text-center text-sm text-muted">
        No hay cuentas para este filtro.
      </BaseCard>
    </div>

    <BaseModal :open="open" :title="editing ? 'Editar cuenta' : 'Nueva cuenta'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="form.name" label="Nombre" required />
          <BaseSelect v-model="form.type" label="Tipo" :options="typeOptions" required />
        </div>
        <BaseInput v-model="form.balance" label="Saldo inicial" type="number" step="0.01" required />

        <div class="rounded-xl border border-surfaceAlt bg-surfaceAlt/30 p-3">
          <p class="mb-2 text-[10px] uppercase tracking-[0.08em] text-muted">Vista previa</p>
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs" :class="typeChipClass(form.type)">
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(path, index) in accountIcon(form.type)" :key="index" :d="path" />
              </svg>
              {{ form.name || 'Nueva cuenta' }}
            </span>
            <span class="text-sm font-semibold text-text">{{ formatMoney(form.balance) }}</span>
          </div>
        </div>

        <BaseButton type="submit" block>{{ editing ? 'Guardar cambios' : 'Crear cuenta' }}</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
