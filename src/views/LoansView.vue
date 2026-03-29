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
  person: '',
  amount: '',
  description: '',
})

const editForm = reactive({
  id: '',
  person: '',
  amount: '',
  paid: '',
  description: '',
})

const history = computed(() =>
  financeStore.loansGiven.map((loan) => ({
    ...loan,
    pending: loan.amount - loan.paid,
  })),
)

const filteredHistory = computed(() =>
  history.value.filter((loan) => loan.person.toLowerCase().includes(search.value.toLowerCase())),
)

const save = () => {
  if (!form.person.trim()) {
    return
  }

  financeStore.addLoanGiven({
    person: form.person,
    amount: Number(form.amount),
    description: form.description,
  })
  form.person = ''
  form.amount = ''
  form.description = ''
  showAdd.value = false
}

const openEdit = (loan) => {
  editForm.id = loan.id
  editForm.person = loan.person
  editForm.amount = String(loan.amount ?? 0)
  editForm.paid = String(loan.paid ?? 0)
  editForm.description = loan.description || ''
  showEdit.value = true
}

const saveEdit = () => {
  if (!editForm.id || !editForm.person.trim()) {
    return
  }

  financeStore.updateLoanGiven(editForm.id, {
    person: editForm.person,
    amount: Number(editForm.amount || 0),
    paid: Number(editForm.paid || 0),
    description: editForm.description,
  })

  showEdit.value = false
}

const deleteLoan = (id) => {
  financeStore.deleteLoanGiven(id)
}

const markAsPaid = async (loan) => {
  if (loan.pending <= 0) {
    return
  }

  try {
    // Create an income transaction for the payment received
    await financeStore.addTransaction({
      amount: loan.pending,
      description: `Pago recibido de ${loan.person} - ${loan.description}`,
      date: new Date().toISOString().split('T')[0], // Today's date
      type: 'income',
      categoryId: null, // Could be set to a specific category if desired
      accountId: null, // Could be set to a default account if desired
    })

    // Update the loan to mark it as fully paid
    await financeStore.updateLoanGiven(loan.id, {
      person: loan.person,
      amount: loan.amount,
      paid: loan.amount, // Mark as fully paid
      description: loan.description,
    })
  } catch (error) {
    console.error('Error marking loan as paid:', error)
  }
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Dinero prestado</h2>
        <p class="muted text-xs">Registro de préstamos a terceros con historial detallado</p>
      </div>
      <BaseButton size="sm" @click="showAdd = true">+ Nuevo préstamo</BaseButton>
    </div>

    <BaseCard>
      <BaseInput v-model="search" label="Buscar por persona" placeholder="Ej. Juan" />
    </BaseCard>

    <div v-if="filteredHistory.length" class="space-y-2">
      <BaseCard v-for="loan in filteredHistory" :key="loan.id">
        <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm text-text">{{ loan.person }}</p>
            <p class="text-xs text-muted">{{ loan.createdAt }} · {{ loan.description }}</p>
            <p class="text-xs text-muted">Prestado: {{ formatUSD(loan.amount, authStore.hideAmounts) }}</p>
            <p class="text-xs text-muted">Pagado: {{ formatUSD(loan.paid, authStore.hideAmounts) }}</p>
            <p class="text-sm font-semibold text-warning">Pendiente: {{ formatUSD(loan.pending, authStore.hideAmounts) }}</p>
          </div>
          <div class="flex gap-1 md:flex-col">
            <button
              v-if="loan.pending > 0"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success transition hover:border-success hover:bg-success/20"
              @click="markAsPaid(loan)"
              :title="'Marcar como pagado'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0Z" fill="currentColor" />
              </svg>
            </button>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
              @click="openEdit(loan)"
              :title="'Editar préstamo'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
              @click="deleteLoan(loan.id)"
              :title="'Eliminar préstamo'"
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
      <p class="text-sm text-text">Aún no has registrado préstamos.</p>
      <p class="mt-1 text-xs text-muted">Agrega el primero para llevar el historial completo.</p>
    </BaseCard>

    <BaseModal :open="showAdd" title="Agregar préstamo" @close="showAdd = false">
      <div class="space-y-3">
        <BaseInput v-model="form.person" label="Persona" placeholder="Nombre" />
        <BaseInput v-model="form.amount" type="number" label="Monto" placeholder="0.00" />
        <BaseInput v-model="form.description" label="Descripción" placeholder="Motivo" />
        <BaseButton block @click="save">Guardar préstamo</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEdit" title="Editar préstamo" @close="showEdit = false">
      <div class="space-y-3">
        <BaseInput v-model="editForm.person" label="Persona" />
        <BaseInput v-model="editForm.amount" type="number" label="Monto" />
        <BaseInput v-model="editForm.paid" type="number" label="Pagado" />
        <BaseInput v-model="editForm.description" label="Descripción" />
        <BaseButton block @click="saveEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
