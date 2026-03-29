<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import { isSupabaseConfigured } from '@/lib/supabase'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseToast from '@/components/ui/BaseToast.vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const toastMessage = ref('')

const notify = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 1800)
}

const runRecurringNow = () => {
  financeStore.materializeRecurringTransactions(new Date())
  notify('Transacciones recurrentes generadas')
}
</script>

<template>
  <section class="app-page">
    <div>
      <h2 class="section-title">Ajustes</h2>
      <p class="muted text-xs">Privacidad, sesión y acciones del sistema</p>
    </div>

    <BaseCard class="space-y-3">
      <h3 class="text-sm font-semibold text-text">Privacidad</h3>
      <p class="text-xs text-muted">Ocultar montos por defecto con botón de ojito.</p>
      <BaseButton block variant="secondary" @click="authStore.toggleHideAmounts">
        {{ authStore.hideAmounts ? 'Mostrar montos' : 'Ocultar montos' }}
      </BaseButton>
    </BaseCard>

    <BaseCard class="space-y-3">
      <h3 class="text-sm font-semibold text-text">Automatizaciones</h3>
      <p class="text-xs text-muted">Ejecuta manualmente la creación de transacciones recurrentes.</p>
      <BaseButton block @click="runRecurringNow">Generar recurrentes</BaseButton>
    </BaseCard>

    <BaseCard class="space-y-3">
      <h3 class="text-sm font-semibold text-text">Autenticación</h3>
      <p class="text-xs text-muted">Modo activo: {{ isSupabaseConfigured ? 'Supabase' : 'Demo local' }}</p>
      <BaseButton block variant="danger" @click="authStore.signOut">Cerrar sesión</BaseButton>
    </BaseCard>

    <BaseToast :visible="Boolean(toastMessage)" :message="toastMessage" />
  </section>
</template>
