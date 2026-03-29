<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { formatUSD } from '@/services/currency'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const search = ref('')
const showAdd = ref(false)
const showEdit = ref(false)

const form = reactive({
  name: '',
  contributions: '',
  withdrawals: '',
  currentValue: '',
})

const editForm = reactive({
  id: '',
  name: '',
  contributions: '',
  withdrawals: '',
  currentValue: '',
})

const investmentsWithPerformance = computed(() =>
  financeStore.investments.map((item) => {
    const capital = item.contributions - item.withdrawals
    const performance = item.currentValue - capital
    return { ...item, capital, performance }
  }),
)

const filteredInvestments = computed(() =>
  investmentsWithPerformance.value.filter((item) => item.name.toLowerCase().includes(search.value.toLowerCase())),
)

const save = () => {
  if (!form.name.trim()) {
    return
  }

  financeStore.addInvestment({
    name: form.name,
    contributions: Number(form.contributions),
    withdrawals: Number(form.withdrawals || 0),
    currentValue: Number(form.currentValue),
  })

  form.name = ''
  form.contributions = ''
  form.withdrawals = ''
  form.currentValue = ''
  showAdd.value = false
}

const openEdit = (investment) => {
  editForm.id = investment.id
  editForm.name = investment.name
  editForm.contributions = String(investment.contributions ?? 0)
  editForm.withdrawals = String(investment.withdrawals ?? 0)
  editForm.currentValue = String(investment.currentValue ?? 0)
  showEdit.value = true
}

const saveEdit = () => {
  if (!editForm.id || !editForm.name.trim()) {
    return
  }

  financeStore.updateInvestment(editForm.id, {
    name: editForm.name,
    contributions: Number(editForm.contributions || 0),
    withdrawals: Number(editForm.withdrawals || 0),
    currentValue: Number(editForm.currentValue || 0),
  })

  showEdit.value = false
}

const deleteInvestment = (id) => {
  financeStore.deleteInvestment(id)
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Inversiones</h2>
        <p class="muted text-xs">Aportes, retiros, valor actual y rendimiento</p>
      </div>
      <BaseButton size="sm" @click="showAdd = true">+ Nueva inversión</BaseButton>
    </div>

    <BaseCard>
      <BaseInput v-model="search" label="Buscar inversión" placeholder="Ej. Fondo indexado" />
    </BaseCard>

    <div v-if="filteredInvestments.length" class="space-y-2">
      <BaseCard v-for="item in filteredInvestments" :key="item.id">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-medium text-text">{{ item.name }}</p>
            <p class="mt-1 text-xs text-muted">Capital neto: {{ formatUSD(item.capital, authStore.hideAmounts) }}</p>
            <p class="text-xs text-muted">Valor actual: {{ formatUSD(item.currentValue, authStore.hideAmounts) }}</p>
            <p class="mt-1 text-sm" :class="item.performance >= 0 ? 'money-positive' : 'money-negative'">
              Rendimiento: {{ formatUSD(item.performance, authStore.hideAmounts) }}
            </p>
          </div>
          <div class="flex gap-1 md:flex-col">
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
              @click="openEdit(item)"
              :title="'Editar inversión'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
              @click="deleteInvestment(item.id)"
              :title="'Eliminar inversión'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-else>
      <p class="text-sm text-text">No hay inversiones registradas.</p>
      <p class="mt-1 text-xs text-muted">Agrega una para comenzar a seguir su rentabilidad.</p>
    </BaseCard>

    <BaseModal :open="showAdd" title="Agregar inversión" @close="showAdd = false">
      <div class="space-y-3">
        <BaseInput v-model="form.name" label="Nombre" placeholder="Ej. ETF S&P 500" />
        <BaseInput v-model="form.contributions" label="Aportes" type="number" placeholder="0.00" />
        <BaseInput v-model="form.withdrawals" label="Retiros" type="number" placeholder="0.00" />
        <BaseInput v-model="form.currentValue" label="Valor actual" type="number" placeholder="0.00" />
        <BaseButton block @click="save">Guardar inversión</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEdit" title="Editar inversión" @close="showEdit = false">
      <div class="space-y-3">
        <BaseInput v-model="editForm.name" label="Nombre" />
        <BaseInput v-model="editForm.contributions" label="Aportes" type="number" />
        <BaseInput v-model="editForm.withdrawals" label="Retiros" type="number" />
        <BaseInput v-model="editForm.currentValue" label="Valor actual" type="number" />
        <BaseButton block @click="saveEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
