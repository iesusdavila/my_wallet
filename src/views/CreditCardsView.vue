<script setup>
import { onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseDateInput from '../components/base/BaseDateInput.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { useCreditCardsStore } from '../stores/creditCards'
import { useUiStore } from '../stores/ui'
import { formatMoney } from '../lib/format'

const creditCardsStore = useCreditCardsStore()
const uiStore = useUiStore()
const open = ref(false)
const editing = ref(null)

const form = reactive({
  name: '',
  outstanding: 0,
  interest_rate: 0,
  due_date: '',
  limit_amount: 0,
})

onMounted(() => creditCardsStore.fetchAll())

function openCreate() {
  editing.value = null
  form.name = ''
  form.outstanding = 0
  form.interest_rate = 0
  form.due_date = ''
  form.limit_amount = 0
  open.value = true
}

function openEdit(row) {
  editing.value = row
  Object.assign(form, row)
  open.value = true
}

async function save() {
  try {
    const payload = {
      name: form.name,
      outstanding: Number(form.outstanding),
      interest_rate: Number(form.interest_rate),
      due_date: form.due_date || null,
      limit_amount: Number(form.limit_amount),
    }
    if (editing.value) {
      await creditCardsStore.update(editing.value.id, payload)
    } else {
      await creditCardsStore.create(payload)
    }
    uiStore.showToast('Tarjeta guardada', 'success')
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(id) {
  await creditCardsStore.remove(id)
  uiStore.showToast('Tarjeta eliminada', 'success')
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Tarjetas de crédito</h2>
      <BaseButton @click="openCreate">Nueva tarjeta</BaseButton>
    </div>

    <div class="grid gap-3">
      <BaseCard v-for="row in creditCardsStore.rows" :key="row.id" class="flex items-center justify-between gap-3">
        <div>
          <p class="font-medium">{{ row.name }}</p>
          <p class="text-sm">Pendiente: {{ formatMoney(row.outstanding) }}</p>
          <p class="text-xs text-muted">Límite: {{ formatMoney(row.limit_amount) }} · Tasa: {{ row.interest_rate }}%</p>
        </div>
        <ActionButtons @edit="openEdit(row)" @delete="remove(row.id)" />
      </BaseCard>
    </div>

    <BaseModal :open="open" :title="editing ? 'Editar tarjeta' : 'Nueva tarjeta'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Nombre" required />
        <BaseInput v-model="form.outstanding" label="Saldo pendiente" type="number" step="0.01" required />
        <BaseInput v-model="form.limit_amount" label="Límite" type="number" step="0.01" required />
        <BaseInput v-model="form.interest_rate" label="Interés (%)" type="number" step="0.01" />
        <BaseDateInput v-model="form.due_date" label="Vencimiento" />
        <BaseButton type="submit" block>Guardar</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
