<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseDateInput from '../components/base/BaseDateInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { usePoliciesStore } from '../stores/policies'
import { useGoalsStore } from '../stores/goals'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'

const policiesStore = usePoliciesStore()
const goalsStore = useGoalsStore()
const uiStore = useUiStore()

const activeTab = ref('policies')
const open = ref(false)
const editing = ref(null)

const form = reactive({
  name: '',
  initial_amount: 0,
  interest_rate: 0,
  start_date: new Date().toISOString().slice(0, 10),
  maturity_date: '',

  limit_amount: 0,
  saved_amount: 0,
  target_date: '',
})

const policiesTotal = computed(() =>
  policiesStore.rows.reduce((acc, row) => acc + Number(row.initial_amount || 0), 0),
)

const goalsProgress = computed(() => {
  const target = goalsStore.rows.reduce((acc, row) => acc + Number(row.limit_amount || 0), 0)
  const saved = goalsStore.rows.reduce((acc, row) => acc + Number(row.saved_amount || 0), 0)
  if (!target) return 0
  return Number(((saved / target) * 100).toFixed(1))
})

onMounted(async () => {
  await Promise.all([policiesStore.fetchAll(), goalsStore.fetchAll()])
})

function resetForm() {
  form.name = ''
  form.initial_amount = 0
  form.interest_rate = 0
  form.start_date = new Date().toISOString().slice(0, 10)
  form.maturity_date = ''
  form.limit_amount = 0
  form.saved_amount = 0
  form.target_date = ''
}

function openCreate(tab) {
  activeTab.value = tab
  editing.value = null
  resetForm()
  open.value = true
}

function openEditPolicy(row) {
  activeTab.value = 'policies'
  editing.value = row
  form.name = row.name
  form.initial_amount = row.initial_amount || 0
  form.interest_rate = row.interest_rate || 0
  form.start_date = row.start_date || new Date().toISOString().slice(0, 10)
  form.maturity_date = row.maturity_date || ''
  open.value = true
}

function openEditGoal(row) {
  activeTab.value = 'goals'
  editing.value = row
  form.name = row.name
  form.limit_amount = row.limit_amount || 0
  form.saved_amount = row.saved_amount || 0
  form.interest_rate = row.interest_rate || 0
  form.target_date = row.target_date || ''
  open.value = true
}

function estimatedPolicyValue(row) {
  const principal = Number(row.initial_amount || 0)
  const rate = Number(row.interest_rate || 0) / 100
  if (!row.start_date || !row.maturity_date || !principal) return principal

  const start = new Date(row.start_date)
  const end = new Date(row.maturity_date)
  const years = Math.max((end - start) / (1000 * 60 * 60 * 24 * 365), 0)
  const estimated = principal * (1 + rate * years)
  return Number(estimated.toFixed(2))
}

async function save() {
  try {
    if (activeTab.value === 'policies') {
      const payload = {
        name: form.name,
        initial_amount: Number(form.initial_amount),
        interest_rate: Number(form.interest_rate),
        start_date: form.start_date,
        maturity_date: form.maturity_date,
      }

      if (editing.value) {
        await policiesStore.update(editing.value.id, payload)
      } else {
        await policiesStore.create(payload)
      }

      uiStore.showToast('Póliza guardada', 'success')
      open.value = false
      return
    }

    const payload = {
      name: form.name,
      limit_amount: Number(form.limit_amount),
      saved_amount: Number(form.saved_amount),
      interest_rate: Number(form.interest_rate),
      target_date: form.target_date,
      frequency: 'monthly',
    }

    if (editing.value) {
      await goalsStore.update(editing.value.id, payload)
    } else {
      await goalsStore.create(payload)
    }

    uiStore.showToast('Meta guardada', 'success')
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function removePolicy(id) {
  await policiesStore.remove(id)
  uiStore.showToast('Póliza eliminada', 'success')
}

async function removeGoal(id) {
  await goalsStore.remove(id)
  uiStore.showToast('Meta eliminada', 'success')
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Pólizas y Metas</h2>
      <div class="flex gap-2">
        <BaseButton aria-label="Nueva póliza" title="Nueva póliza" @click="openCreate('policies')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" /></svg>
        </BaseButton>
        <BaseButton variant="success" aria-label="Nueva meta" title="Nueva meta" @click="openCreate('goals')">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /></svg>
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <BaseCard class="border border-[#5d5f86] bg-[#343550]/40">
        <p class="text-xs text-muted">Capital en pólizas</p>
        <p class="text-lg font-semibold text-[#c9caee]">{{ formatMoney(policiesTotal) }}</p>
      </BaseCard>
      <BaseCard class="border border-[#2b7a5c] bg-[#1d4a39]/40">
        <p class="text-xs text-muted">Progreso global metas</p>
        <p class="text-lg font-semibold text-[#98f0c6]">{{ goalsProgress }}%</p>
      </BaseCard>
    </div>

    <BaseCard>
      <div class="flex justify-center">
        <div class="relative inline-grid grid-cols-2 rounded-full border border-surfaceAlt bg-surfaceAlt/40 p-1">
          <span
            class="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-primary/25 shadow-soft transition-transform duration-200"
            :class="activeTab === 'goals' ? 'translate-x-full' : 'translate-x-0'"
          />
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeTab === 'policies' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeTab = 'policies'"
          >
            Pólizas
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition"
            :class="activeTab === 'goals' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="activeTab = 'goals'"
          >
            Metas
          </button>
        </div>
      </div>
    </BaseCard>

    <template v-if="activeTab === 'policies'">
      <div class="grid gap-3">
        <BaseCard v-for="row in policiesStore.rows" :key="row.id" class="flex items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm font-medium text-text">{{ row.name }}</p>
            <p class="text-xs text-muted">Inicial: {{ formatMoney(row.initial_amount) }} · Tasa: {{ row.interest_rate || 0 }}%</p>
            <p class="text-xs text-muted">Inicio: {{ row.start_date || '-' }} · Vence: {{ row.maturity_date || '-' }}</p>
            <p class="text-sm font-semibold text-[#c9caee]">Estimado al vencimiento: {{ formatMoney(estimatedPolicyValue(row)) }}</p>
          </div>
          <ActionButtons @edit="openEditPolicy(row)" @delete="removePolicy(row.id)" />
        </BaseCard>

        <BaseCard v-if="policiesStore.rows.length === 0" class="text-center text-sm text-muted">
          No tienes pólizas registradas.
        </BaseCard>
      </div>
    </template>

    <template v-else>
      <div class="grid gap-3">
        <BaseCard v-for="row in goalsStore.rows" :key="row.id" class="flex items-center justify-between gap-3">
          <div class="space-y-1">
            <p class="text-sm font-medium text-text">{{ row.name }}</p>
            <p class="text-xs text-muted">Meta: {{ formatMoney(row.limit_amount) }} · Ahorrado: {{ formatMoney(row.saved_amount) }}</p>
            <p class="text-xs text-muted">Interés: {{ row.interest_rate || 0 }}% · Fecha objetivo: {{ row.target_date || '-' }}</p>
            <p class="text-sm font-semibold text-[#98f0c6]">
              Avance: {{ row.limit_amount ? ((Number(row.saved_amount || 0) / Number(row.limit_amount || 1)) * 100).toFixed(1) : 0 }}%
            </p>
          </div>
          <ActionButtons @edit="openEditGoal(row)" @delete="removeGoal(row.id)" />
        </BaseCard>

        <BaseCard v-if="goalsStore.rows.length === 0" class="text-center text-sm text-muted">
          No tienes metas registradas.
        </BaseCard>
      </div>
    </template>

    <BaseModal :open="open" :title="editing ? `Editar ${activeTab === 'policies' ? 'póliza' : 'meta'}` : `Nueva ${activeTab === 'policies' ? 'póliza' : 'meta'}`" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Nombre" required />

        <template v-if="activeTab === 'policies'">
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="form.initial_amount" label="Valor inicial" type="number" step="0.01" required />
            <BaseInput v-model="form.interest_rate" label="Tasa (%)" type="number" step="0.01" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseDateInput v-model="form.start_date" label="Fecha inicio" required />
            <BaseDateInput v-model="form.maturity_date" label="Fecha vencimiento" required />
          </div>
        </template>

        <template v-else>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="form.limit_amount" label="Monto objetivo" type="number" step="0.01" required />
            <BaseInput v-model="form.saved_amount" label="Ahorro acumulado" type="number" step="0.01" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="form.interest_rate" label="Tasa fija (%)" type="number" step="0.01" required />
            <BaseDateInput v-model="form.target_date" label="Fecha objetivo" required />
          </div>
        </template>

        <BaseButton type="submit" block>Guardar</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
