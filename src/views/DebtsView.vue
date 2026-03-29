<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { formatUSD } from '@/services/currency'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()

const filters = reactive({
  type: '',
  text: '',
})

const showDebtModal = ref(false)
const showCardModal = ref(false)
const showEditDebtModal = ref(false)
const showEditCardModal = ref(false)

const debtForm = reactive({
  name: '',
  balance: '',
  interestRate: '',
  dueDate: '',
})

const cardForm = reactive({
  name: '',
  outstanding: '',
  creditLimit: '',
  closingDay: '',
  dueDay: '',
  monthlyRate: '',
})

const editDebtForm = reactive({
  id: '',
  name: '',
  balance: '',
  interestRate: '',
  dueDate: '',
})

const editCardForm = reactive({
  id: '',
  name: '',
  outstanding: '',
  creditLimit: '',
  closingDay: '',
  dueDay: '',
  monthlyRate: '',
})

const filteredDebts = computed(() =>
  financeStore.debts.filter((item) => {
    if (filters.type && filters.type !== 'loan') {
      return false
    }
    if (filters.text && !item.name.toLowerCase().includes(filters.text.toLowerCase())) {
      return false
    }
    return true
  }),
)

const filteredCards = computed(() =>
  financeStore.creditCards.filter((item) => {
    if (filters.type && filters.type !== 'card') {
      return false
    }
    if (filters.text && !item.name.toLowerCase().includes(filters.text.toLowerCase())) {
      return false
    }
    return true
  }),
)

const saveDebt = () => {
  if (!debtForm.name.trim()) {
    return
  }

  financeStore.addDebt({
    name: debtForm.name,
    balance: Number(debtForm.balance || 0),
    interestRate: Number(debtForm.interestRate || 0),
    dueDate: debtForm.dueDate || null,
  })

  debtForm.name = ''
  debtForm.balance = ''
  debtForm.interestRate = ''
  debtForm.dueDate = ''
  showDebtModal.value = false
}

const saveCard = () => {
  if (!cardForm.name.trim()) {
    return
  }

  financeStore.addCreditCard({
    name: cardForm.name,
    outstanding: Number(cardForm.outstanding || 0),
    creditLimit: Number(cardForm.creditLimit || 0),
    closingDay: Number(cardForm.closingDay || 1),
    dueDay: Number(cardForm.dueDay || 1),
    monthlyRate: Number(cardForm.monthlyRate || 0),
  })

  cardForm.name = ''
  cardForm.outstanding = ''
  cardForm.creditLimit = ''
  cardForm.closingDay = ''
  cardForm.dueDay = ''
  cardForm.monthlyRate = ''
  showCardModal.value = false
}

const openDebtEdit = (debt) => {
  editDebtForm.id = debt.id
  editDebtForm.name = debt.name
  editDebtForm.balance = String(debt.balance ?? 0)
  editDebtForm.interestRate = String(debt.interestRate ?? 0)
  editDebtForm.dueDate = debt.dueDate || ''
  showEditDebtModal.value = true
}

const saveDebtEdit = () => {
  if (!editDebtForm.id || !editDebtForm.name.trim()) {
    return
  }

  financeStore.updateDebt(editDebtForm.id, {
    name: editDebtForm.name,
    balance: Number(editDebtForm.balance || 0),
    interestRate: Number(editDebtForm.interestRate || 0),
    dueDate: editDebtForm.dueDate || null,
  })

  showEditDebtModal.value = false
}

const openCardEdit = (card) => {
  editCardForm.id = card.id
  editCardForm.name = card.name
  editCardForm.outstanding = String(card.outstanding ?? 0)
  editCardForm.creditLimit = String(card.creditLimit ?? 0)
  editCardForm.closingDay = String(card.closingDay ?? 1)
  editCardForm.dueDay = String(card.dueDay ?? 1)
  editCardForm.monthlyRate = String(card.monthlyRate ?? 0)
  showEditCardModal.value = true
}

const saveCardEdit = () => {
  if (!editCardForm.id || !editCardForm.name.trim()) {
    return
  }

  financeStore.updateCreditCard(editCardForm.id, {
    name: editCardForm.name,
    outstanding: Number(editCardForm.outstanding || 0),
    creditLimit: Number(editCardForm.creditLimit || 0),
    closingDay: Number(editCardForm.closingDay || 1),
    dueDay: Number(editCardForm.dueDay || 1),
    monthlyRate: Number(editCardForm.monthlyRate || 0),
  })

  showEditCardModal.value = false
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Deudas y tarjetas</h2>
        <p class="muted text-xs">Control de préstamos y tarjetas con filtros y alta rápida</p>
      </div>
      <div class="flex gap-2">
        <BaseButton size="sm" variant="secondary" @click="showDebtModal = true">+ Deuda</BaseButton>
        <BaseButton size="sm" @click="showCardModal = true">+ Tarjeta</BaseButton>
      </div>
    </div>

    <BaseCard>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <BaseSelect
          v-model="filters.type"
          label="Filtrar por tipo"
          :options="[
            { value: 'loan', label: 'Deudas' },
            { value: 'card', label: 'Tarjetas' },
          ]"
        />
        <BaseInput v-model="filters.text" label="Buscar" placeholder="Ej. Visa, préstamo auto" />
      </div>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Deudas activas</h3>
      <div v-if="filteredDebts.length" class="space-y-2">
        <div v-for="debt in filteredDebts" :key="debt.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-sm text-text">{{ debt.name }}</p>
              <p class="text-xs text-muted">Vence: {{ debt.dueDate || 'Sin fecha' }} · Interés: {{ debt.interestRate }}%</p>
              <p class="mt-1 text-sm text-danger">Saldo: {{ formatUSD(debt.balance, authStore.hideAmounts) }}</p>
            </div>
            <div class="flex gap-1 md:flex-col">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openDebtEdit(debt)"
                :title="'Editar deuda'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="financeStore.deleteDebt(debt.id)"
                :title="'Eliminar deuda'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-muted">No hay deudas para los filtros seleccionados.</p>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Tarjetas de crédito</h3>
      <div v-if="filteredCards.length" class="space-y-2">
        <div v-for="card in filteredCards" :key="card.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-sm text-text">{{ card.name }}</p>
              <p class="text-xs text-muted">Corte: día {{ card.closingDay }} · Pago: día {{ card.dueDay }}</p>
              <p class="text-xs text-muted">Interés mensual: {{ card.monthlyRate }}% · Límite: {{ formatUSD(card.creditLimit, authStore.hideAmounts) }}</p>
              <p class="mt-1 text-sm text-danger">Pendiente: {{ formatUSD(card.outstanding, authStore.hideAmounts) }}</p>
            </div>
            <div class="flex gap-1 md:flex-col">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openCardEdit(card)"
                :title="'Editar tarjeta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="financeStore.deleteCreditCard(card.id)"
                :title="'Eliminar tarjeta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-muted">No hay tarjetas para los filtros seleccionados.</p>
    </BaseCard>

    <BaseModal :open="showDebtModal" title="Agregar deuda" @close="showDebtModal = false">
      <div class="space-y-3">
        <BaseInput v-model="debtForm.name" label="Nombre" placeholder="Ej. Préstamo auto" />
        <BaseInput v-model="debtForm.balance" type="number" label="Saldo" placeholder="0.00" />
        <BaseInput v-model="debtForm.interestRate" type="number" label="Interés %" placeholder="0" />
        <BaseInput v-model="debtForm.dueDate" type="date" label="Fecha de vencimiento" />
        <BaseButton block @click="saveDebt">Guardar deuda</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showCardModal" title="Agregar tarjeta" @close="showCardModal = false">
      <div class="space-y-3">
        <BaseInput v-model="cardForm.name" label="Nombre" placeholder="Ej. Visa" />
        <BaseInput v-model="cardForm.outstanding" type="number" label="Saldo pendiente" placeholder="0.00" />
        <BaseInput v-model="cardForm.creditLimit" type="number" label="Límite" placeholder="0.00" />
        <div class="grid grid-cols-2 gap-2">
          <BaseInput v-model="cardForm.closingDay" type="number" label="Día de corte" placeholder="1-31" />
          <BaseInput v-model="cardForm.dueDay" type="number" label="Día de pago" placeholder="1-31" />
        </div>
        <BaseInput v-model="cardForm.monthlyRate" type="number" label="Interés mensual %" placeholder="0" />
        <BaseButton block @click="saveCard">Guardar tarjeta</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEditDebtModal" title="Editar deuda" @close="showEditDebtModal = false">
      <div class="space-y-3">
        <BaseInput v-model="editDebtForm.name" label="Nombre" />
        <BaseInput v-model="editDebtForm.balance" type="number" label="Saldo" />
        <BaseInput v-model="editDebtForm.interestRate" type="number" label="Interés %" />
        <BaseInput v-model="editDebtForm.dueDate" type="date" label="Fecha de vencimiento" />
        <BaseButton block @click="saveDebtEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEditCardModal" title="Editar tarjeta" @close="showEditCardModal = false">
      <div class="space-y-3">
        <BaseInput v-model="editCardForm.name" label="Nombre" />
        <BaseInput v-model="editCardForm.outstanding" type="number" label="Saldo pendiente" />
        <BaseInput v-model="editCardForm.creditLimit" type="number" label="Límite" />
        <div class="grid grid-cols-2 gap-2">
          <BaseInput v-model="editCardForm.closingDay" type="number" label="Día de corte" />
          <BaseInput v-model="editCardForm.dueDay" type="number" label="Día de pago" />
        </div>
        <BaseInput v-model="editCardForm.monthlyRate" type="number" label="Interés mensual %" />
        <BaseButton block @click="saveCardEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
