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
const search = ref('')
const showBudgetModal = ref(false)
const showGoalModal = ref(false)
const showSubscriptionModal = ref(false)
const showEditBudgetModal = ref(false)
const showEditGoalModal = ref(false)
const showEditSubscriptionModal = ref(false)

const budgetForm = reactive({ name: '', scope: 'category', monthlyLimit: '' })
const goalForm = reactive({ name: '', targetAmount: '', savedAmount: '', interestRate: '', deadline: '' })
const subscriptionForm = reactive({ name: '', amount: '', cadence: 'monthly', nextChargeDate: '' })
const editBudgetForm = reactive({ id: '', name: '', scope: 'category', monthlyLimit: '', spent: '' })
const editGoalForm = reactive({ id: '', name: '', targetAmount: '', savedAmount: '', interestRate: '', deadline: '' })
const editSubscriptionForm = reactive({ id: '', name: '', amount: '', cadence: 'monthly', nextChargeDate: '' })

const budgetsWithAlert = computed(() =>
  financeStore.budgets
    .filter((budget) => budget.name.toLowerCase().includes(search.value.toLowerCase()))
    .map((budget) => ({
      ...budget,
      ratio: budget.monthlyLimit > 0 ? (budget.spent / budget.monthlyLimit) * 100 : 0,
    })),
)

const goalsProgress = computed(() =>
  financeStore.goals
    .filter((goal) => goal.name.toLowerCase().includes(search.value.toLowerCase()))
    .map((goal) => ({
      ...goal,
      ratio: goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0,
      estimatedYearlyInterest: goal.savedAmount * ((goal.interestRate || 0) / 100),
    })),
)

const filteredSubscriptions = computed(() =>
  financeStore.subscriptions.filter((item) => item.name.toLowerCase().includes(search.value.toLowerCase())),
)

const addBudget = () => {
  if (!budgetForm.name.trim()) {
    return
  }
  financeStore.addBudget({
    name: budgetForm.name,
    scope: budgetForm.scope,
    scopeId: null,
    monthlyLimit: Number(budgetForm.monthlyLimit || 0),
    spent: 0,
  })
  budgetForm.name = ''
  budgetForm.scope = 'category'
  budgetForm.monthlyLimit = ''
  showBudgetModal.value = false
}

const addGoal = () => {
  if (!goalForm.name.trim()) {
    return
  }
  financeStore.addGoal({
    name: goalForm.name,
    targetAmount: Number(goalForm.targetAmount || 0),
    savedAmount: Number(goalForm.savedAmount || 0),
    interestRate: Number(goalForm.interestRate || 0),
    deadline: goalForm.deadline || null,
  })
  goalForm.name = ''
  goalForm.targetAmount = ''
  goalForm.savedAmount = ''
  goalForm.interestRate = ''
  goalForm.deadline = ''
  showGoalModal.value = false
}

const addSubscription = () => {
  if (!subscriptionForm.name.trim()) {
    return
  }
  financeStore.addSubscription({
    name: subscriptionForm.name,
    amount: Number(subscriptionForm.amount || 0),
    cadence: subscriptionForm.cadence,
    nextChargeDate: subscriptionForm.nextChargeDate || null,
  })
  subscriptionForm.name = ''
  subscriptionForm.amount = ''
  subscriptionForm.cadence = 'monthly'
  subscriptionForm.nextChargeDate = ''
  showSubscriptionModal.value = false
}

const openBudgetEdit = (budget) => {
  editBudgetForm.id = budget.id
  editBudgetForm.name = budget.name
  editBudgetForm.scope = budget.scope
  editBudgetForm.monthlyLimit = String(budget.monthlyLimit ?? 0)
  editBudgetForm.spent = String(budget.spent ?? 0)
  showEditBudgetModal.value = true
}

const saveBudgetEdit = () => {
  if (!editBudgetForm.id || !editBudgetForm.name.trim()) {
    return
  }

  financeStore.updateBudget(editBudgetForm.id, {
    name: editBudgetForm.name,
    scope: editBudgetForm.scope,
    monthlyLimit: Number(editBudgetForm.monthlyLimit || 0),
    spent: Number(editBudgetForm.spent || 0),
  })
  showEditBudgetModal.value = false
}

const openGoalEdit = (goal) => {
  editGoalForm.id = goal.id
  editGoalForm.name = goal.name
  editGoalForm.targetAmount = String(goal.targetAmount ?? 0)
  editGoalForm.savedAmount = String(goal.savedAmount ?? 0)
  editGoalForm.interestRate = String(goal.interestRate ?? 0)
  editGoalForm.deadline = goal.deadline || ''
  showEditGoalModal.value = true
}

const saveGoalEdit = () => {
  if (!editGoalForm.id || !editGoalForm.name.trim()) {
    return
  }

  financeStore.updateGoal(editGoalForm.id, {
    name: editGoalForm.name,
    targetAmount: Number(editGoalForm.targetAmount || 0),
    savedAmount: Number(editGoalForm.savedAmount || 0),
    interestRate: Number(editGoalForm.interestRate || 0),
    deadline: editGoalForm.deadline || null,
  })
  showEditGoalModal.value = false
}

const openSubscriptionEdit = (subscription) => {
  editSubscriptionForm.id = subscription.id
  editSubscriptionForm.name = subscription.name
  editSubscriptionForm.amount = String(subscription.amount ?? 0)
  editSubscriptionForm.cadence = subscription.cadence
  editSubscriptionForm.nextChargeDate = subscription.nextChargeDate || ''
  showEditSubscriptionModal.value = true
}

const saveSubscriptionEdit = () => {
  if (!editSubscriptionForm.id || !editSubscriptionForm.name.trim()) {
    return
  }

  financeStore.updateSubscription(editSubscriptionForm.id, {
    name: editSubscriptionForm.name,
    amount: Number(editSubscriptionForm.amount || 0),
    cadence: editSubscriptionForm.cadence,
    nextChargeDate: editSubscriptionForm.nextChargeDate || null,
  })
  showEditSubscriptionModal.value = false
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Planificación</h2>
        <p class="muted text-xs">Presupuestos, metas y suscripciones</p>
      </div>
      <div class="flex gap-2">
        <BaseButton size="sm" variant="secondary" @click="showBudgetModal = true">+ Presupuesto</BaseButton>
        <BaseButton size="sm" @click="showGoalModal = true">+ Meta</BaseButton>
      </div>
    </div>

    <BaseCard>
      <BaseInput v-model="search" label="Buscar en planificación" placeholder="Ej. viaje, Netflix" />
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Presupuestos mensuales</h3>
      <div v-if="budgetsWithAlert.length" class="space-y-2">
        <div v-for="budget in budgetsWithAlert" :key="budget.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-sm text-text">{{ budget.name }}</p>
              <p class="text-xs text-muted">
                {{ formatUSD(budget.spent, authStore.hideAmounts) }} / {{ formatUSD(budget.monthlyLimit, authStore.hideAmounts) }}
              </p>
              <p class="text-xs" :class="budget.ratio >= 100 ? 'text-danger' : budget.ratio >= 80 ? 'text-warning' : 'text-success'">
                {{ budget.ratio >= 100 ? 'Alerta: presupuesto excedido' : budget.ratio >= 80 ? 'Atención: cerca del límite' : 'Dentro del límite' }}
              </p>
            </div>
            <div class="flex gap-1 md:flex-col">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openBudgetEdit(budget)"
                :title="'Editar presupuesto'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="financeStore.deleteBudget(budget.id)"
                :title="'Eliminar presupuesto'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-muted">No hay presupuestos para mostrar.</p>
    </BaseCard>

    <BaseCard>
      <h3 class="mb-2 text-sm font-semibold text-text">Metas de ahorro</h3>
      <div v-if="goalsProgress.length" class="space-y-2">
        <div v-for="goal in goalsProgress" :key="goal.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div class="min-w-0 flex-1">
              <p class="text-sm text-text">{{ goal.name }}</p>
              <p class="text-xs text-muted">Meta: {{ formatUSD(goal.targetAmount, authStore.hideAmounts) }} · Vence: {{ goal.deadline || 'Sin fecha' }}</p>
              <p class="text-xs text-muted">Interés anual: {{ Number(goal.interestRate || 0).toFixed(2) }}% · Estimado: {{ formatUSD(goal.estimatedYearlyInterest, authStore.hideAmounts) }}</p>
              <div class="mt-2 h-2 rounded-full bg-surface">
                <div class="h-2 rounded-full bg-primary" :style="{ width: `${Math.min(goal.ratio, 100)}%` }" />
              </div>
            </div>
            <div class="flex gap-1 md:flex-col">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openGoalEdit(goal)"
                :title="'Editar meta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="financeStore.deleteGoal(goal.id)"
                :title="'Eliminar meta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-muted">No hay metas para mostrar.</p>
    </BaseCard>

    <BaseCard>
      <div class="mb-2 flex items-center justify-between gap-2">
        <h3 class="text-sm font-semibold text-text">Suscripciones</h3>
        <BaseButton size="sm" variant="secondary" @click="showSubscriptionModal = true">+ Suscripción</BaseButton>
      </div>
      <div v-if="filteredSubscriptions.length" class="space-y-2">
        <div v-for="subscription in filteredSubscriptions" :key="subscription.id" class="rounded-xl border border-border bg-surface-2 p-3">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-sm text-text">{{ subscription.name }}</p>
              <p class="text-xs text-muted">{{ formatUSD(subscription.amount, authStore.hideAmounts) }} · {{ subscription.cadence }}</p>
              <p class="text-xs text-muted">Próximo cargo: {{ subscription.nextChargeDate || 'Sin fecha' }}</p>
            </div>
            <div class="flex gap-1 md:flex-col">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openSubscriptionEdit(subscription)"
                :title="'Editar suscripción'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="financeStore.deleteSubscription(subscription.id)"
                :title="'Eliminar suscripción'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-xs text-muted">No hay suscripciones para mostrar.</p>
    </BaseCard>

    <BaseModal :open="showBudgetModal" title="Agregar presupuesto" @close="showBudgetModal = false">
      <div class="space-y-3">
        <BaseInput v-model="budgetForm.name" label="Nombre" placeholder="Ej. Gastos hogar" />
        <BaseSelect
          v-model="budgetForm.scope"
          label="Ámbito"
          :options="[
            { value: 'category', label: 'Categoría' },
            { value: 'account', label: 'Cuenta' },
          ]"
        />
        <BaseInput v-model="budgetForm.monthlyLimit" type="number" label="Límite mensual" placeholder="0.00" />
        <BaseButton block @click="addBudget">Guardar presupuesto</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showGoalModal" title="Agregar meta" @close="showGoalModal = false">
      <div class="space-y-3">
        <BaseInput v-model="goalForm.name" label="Nombre" placeholder="Ej. Fondo viaje" />
        <BaseInput v-model="goalForm.targetAmount" type="number" label="Objetivo" placeholder="0.00" />
        <BaseInput v-model="goalForm.savedAmount" type="number" label="Ahorro actual" placeholder="0.00" />
        <BaseInput v-model="goalForm.interestRate" type="number" label="Interés anual (%)" placeholder="0.00" />
        <BaseInput v-model="goalForm.deadline" type="date" label="Fecha objetivo" />
        <BaseButton block @click="addGoal">Guardar meta</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showSubscriptionModal" title="Agregar suscripción" @close="showSubscriptionModal = false">
      <div class="space-y-3">
        <BaseInput v-model="subscriptionForm.name" label="Nombre" placeholder="Ej. Netflix" />
        <BaseInput v-model="subscriptionForm.amount" type="number" label="Monto" placeholder="0.00" />
        <BaseSelect
          v-model="subscriptionForm.cadence"
          label="Frecuencia"
          :options="[
            { value: 'monthly', label: 'Mensual' },
            { value: 'yearly', label: 'Anual' },
          ]"
        />
        <BaseInput v-model="subscriptionForm.nextChargeDate" type="date" label="Próximo cobro" />
        <BaseButton block @click="addSubscription">Guardar suscripción</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEditBudgetModal" title="Editar presupuesto" @close="showEditBudgetModal = false">
      <div class="space-y-3">
        <BaseInput v-model="editBudgetForm.name" label="Nombre" />
        <BaseSelect
          v-model="editBudgetForm.scope"
          label="Ámbito"
          :options="[
            { value: 'category', label: 'Categoría' },
            { value: 'account', label: 'Cuenta' },
          ]"
        />
        <BaseInput v-model="editBudgetForm.monthlyLimit" type="number" label="Límite mensual" />
        <BaseInput v-model="editBudgetForm.spent" type="number" label="Gastado" />
        <BaseButton block @click="saveBudgetEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEditGoalModal" title="Editar meta" @close="showEditGoalModal = false">
      <div class="space-y-3">
        <BaseInput v-model="editGoalForm.name" label="Nombre" />
        <BaseInput v-model="editGoalForm.targetAmount" type="number" label="Objetivo" />
        <BaseInput v-model="editGoalForm.savedAmount" type="number" label="Ahorro actual" />
        <BaseInput v-model="editGoalForm.interestRate" type="number" label="Interés anual (%)" />
        <BaseInput v-model="editGoalForm.deadline" type="date" label="Fecha objetivo" />
        <BaseButton block @click="saveGoalEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEditSubscriptionModal" title="Editar suscripción" @close="showEditSubscriptionModal = false">
      <div class="space-y-3">
        <BaseInput v-model="editSubscriptionForm.name" label="Nombre" />
        <BaseInput v-model="editSubscriptionForm.amount" type="number" label="Monto" />
        <BaseSelect
          v-model="editSubscriptionForm.cadence"
          label="Frecuencia"
          :options="[
            { value: 'monthly', label: 'Mensual' },
            { value: 'yearly', label: 'Anual' },
          ]"
        />
        <BaseInput v-model="editSubscriptionForm.nextChargeDate" type="date" label="Próximo cobro" />
        <BaseButton block @click="saveSubscriptionEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
