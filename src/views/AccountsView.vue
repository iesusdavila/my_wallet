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

const query = ref('')
const showAdd = ref(false)
const showEdit = ref(false)

const form = reactive({
  name: '',
  type: 'checking',
  balance: '',
})

const editForm = reactive({
  id: '',
  name: '',
  type: 'checking',
  balance: '',
})

const filteredAccounts = computed(() =>
  financeStore.accounts.filter((account) => account.name.toLowerCase().includes(query.value.toLowerCase())),
)

const saveAccount = () => {
  if (!form.name.trim()) {
    return
  }

  financeStore.addAccount({
    name: form.name,
    type: form.type,
    balance: Number(form.balance || 0),
  })

  form.name = ''
  form.type = 'checking'
  form.balance = ''
  showAdd.value = false
}

const openEdit = (account) => {
  editForm.id = account.id
  editForm.name = account.name
  editForm.type = account.type
  editForm.balance = String(account.balance ?? 0)
  showEdit.value = true
}

const saveEdit = () => {
  if (!editForm.id || !editForm.name.trim()) {
    return
  }

  financeStore.updateAccount(editForm.id, {
    name: editForm.name,
    type: editForm.type,
    balance: Number(editForm.balance || 0),
  })

  showEdit.value = false
}

const deleteAccount = (id) => {
  financeStore.deleteAccount(id)
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Cuentas</h2>
        <p class="muted text-xs">Administra saldos, liquidez y crecimiento de tus cuentas</p>
      </div>
      <BaseButton size="sm" @click="showAdd = true">+ Nueva cuenta</BaseButton>
    </div>

    <BaseCard>
      <BaseInput v-model="query" label="Buscar cuenta" placeholder="Ej. Banco principal" />
    </BaseCard>

    <div v-if="filteredAccounts.length" class="space-y-2">
      <BaseCard v-for="account in filteredAccounts" :key="account.id">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-text">{{ account.name }}</p>
            <p class="text-xs uppercase tracking-wide text-muted">{{ account.type }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold text-text">{{ formatUSD(account.balance, authStore.hideAmounts) }}</p>
            <div class="flex gap-1">
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
                @click="openEdit(account)"
                :title="'Editar cuenta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
                @click="deleteAccount(account.id)"
                :title="'Eliminar cuenta'"
              >
                <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-else>
      <p class="text-sm text-text">No tienes cuentas registradas.</p>
      <p class="mt-1 text-xs text-muted">Crea tu primera cuenta para comenzar a registrar movimientos.</p>
    </BaseCard>

    <BaseModal :open="showAdd" title="Agregar cuenta" @close="showAdd = false">
      <div class="space-y-3">
        <BaseInput v-model="form.name" label="Nombre" placeholder="Ej. Banco principal" />
        <BaseSelect
          v-model="form.type"
          label="Tipo"
          :options="[
            { value: 'checking', label: 'Corriente' },
            { value: 'savings', label: 'Ahorros' },
            { value: 'cash', label: 'Efectivo' },
          ]"
        />
        <BaseInput v-model="form.balance" type="number" label="Saldo inicial" placeholder="0.00" />
        <BaseButton block @click="saveAccount">Guardar cuenta</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEdit" title="Editar cuenta" @close="showEdit = false">
      <div class="space-y-3">
        <BaseInput v-model="editForm.name" label="Nombre" />
        <BaseSelect
          v-model="editForm.type"
          label="Tipo"
          :options="[
            { value: 'checking', label: 'Corriente' },
            { value: 'savings', label: 'Ahorros' },
            { value: 'cash', label: 'Efectivo' },
          ]"
        />
        <BaseInput v-model="editForm.balance" type="number" label="Saldo" />
        <BaseButton block @click="saveEdit">Guardar cambios</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>
