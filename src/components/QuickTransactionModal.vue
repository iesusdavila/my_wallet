<script setup>
import { reactive, computed, watch } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseDateInput from '@/components/ui/BaseDateInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'create',
  },
  title: {
    type: String,
    default: 'Nuevo movimiento',
  },
  submitLabel: {
    type: String,
    default: 'Guardar',
  },
  fixedType: {
    type: Boolean,
    default: false,
  },
  initialValues: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const financeStore = useFinanceStore()

const getDefaultForm = () => ({
  type: 'expense',
  amount: '',
  categoryId: '',
  accountId: '',
  destinationAccountId: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
})

const form = reactive(getDefaultForm())

const categoryOptions = computed(() =>
  financeStore.categories
    .filter((item) => (form.type === 'income' ? item.type === 'income' : item.type === 'expense'))
    .map((item) => ({ value: item.id, label: item.name })),
)

const accountOptions = computed(() => financeStore.accounts.map((item) => ({ value: item.id, label: item.name })))

const canSave = computed(() => {
  if (!form.amount || Number(form.amount) <= 0 || !form.accountId) {
    return false
  }

  if (form.type !== 'transfer' && !form.categoryId) {
    return false
  }

  if (form.type === 'transfer' && !form.destinationAccountId) {
    return false
  }

  return true
})

const typeLabel = computed(() => (form.type === 'income' ? 'Ingreso' : form.type === 'expense' ? 'Gasto' : 'Transferencia'))

const fillForm = (values = {}) => {
  form.type = values.type ?? 'expense'
  form.amount = values.amount ?? ''
  form.categoryId = values.categoryId ?? ''
  form.accountId = values.accountId ?? ''
  form.destinationAccountId = values.destinationAccountId ?? ''
  form.date = values.date ?? new Date().toISOString().slice(0, 10)
  form.description = values.description ?? ''
}

const reset = () => {
  fillForm(getDefaultForm())
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      reset()
      return
    }

    if (props.mode === 'edit' && props.initialValues) {
      fillForm(props.initialValues)
      return
    }

    reset()
  },
)

const save = () => {
  if (!canSave.value) {
    return
  }

  const payload = {
    type: form.type,
    amount: Number(form.amount),
    categoryId: form.type === 'transfer' ? null : form.categoryId,
    accountId: form.accountId,
    destinationAccountId: form.type === 'transfer' ? form.destinationAccountId : null,
    date: form.date,
    description: form.description,
  }

  if (props.mode === 'edit') {
    emit('saved', payload)
    emit('close')
    return
  }

  financeStore.addTransaction(payload)

  reset()
  emit('saved')
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="title" @close="$emit('close')">
    <div class="grid grid-cols-1 gap-3">
      <p v-if="!accountOptions.length" class="rounded-xl border border-warning/40 bg-warning/10 p-2 text-xs text-warning">
        Primero crea al menos una cuenta para registrar movimientos.
      </p>

      <label v-if="fixedType" class="flex w-full flex-col gap-1.5 text-xs text-muted">
        <span>Tipo</span>
        <input
          :value="typeLabel"
          class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none"
          disabled
        />
      </label>
      <BaseSelect
        v-else
        v-model="form.type"
        label="Tipo"
        :options="[
          { value: 'expense', label: 'Gasto' },
          { value: 'income', label: 'Ingreso' },
          { value: 'transfer', label: 'Transferencia' },
        ]"
      />
      <BaseInput v-model="form.amount" label="Monto" type="number" placeholder="0.00" />
      <BaseSelect v-if="form.type !== 'transfer'" v-model="form.categoryId" label="Categoría" :options="categoryOptions" />
      <BaseSelect v-model="form.accountId" label="Cuenta origen" :options="accountOptions" />
      <BaseSelect
        v-if="form.type === 'transfer'"
        v-model="form.destinationAccountId"
        label="Cuenta destino"
        :options="accountOptions"
      />
      <BaseDateInput v-model="form.date" label="Fecha" />
      <BaseInput v-model="form.description" label="Descripción" placeholder="Detalle del movimiento" />
      <BaseButton block :disabled="!canSave" @click="save">{{ submitLabel }}</BaseButton>
    </div>
  </BaseModal>
</template>
