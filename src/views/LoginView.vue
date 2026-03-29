<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isSupabaseConfigured } from '@/lib/supabase'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTabs from '@/components/ui/BaseTabs.vue'

const router = useRouter()
const authStore = useAuthStore()
const mode = ref('google')
const errorMessage = ref('')
const form = reactive({ email: '', password: '' })

const signInGoogle = async () => {
  errorMessage.value = ''
  try {
    await authStore.signInWithGoogle()
    if (!isSupabaseConfigured) {
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error.message
  }
}

const signInEmail = async () => {
  errorMessage.value = ''
  try {
    await authStore.signInWithEmail(form)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}

const signUpEmail = async () => {
  errorMessage.value = ''
  try {
    await authStore.signUpWithEmail(form)
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <section class="mx-auto flex min-h-svh w-full max-w-md items-center px-4 py-6">
    <BaseCard class="w-full space-y-5 p-5">
      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <p class="text-xs uppercase tracking-[0.12em] text-muted">My Wallet</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight text-text">Bienvenido</h1>
        <p class="mt-2 text-xs text-muted">Controla cuentas, deudas, inversiones y planificación en un solo lugar.</p>
      </div>

      <BaseTabs
        v-model="mode"
        :tabs="[
          { value: 'google', label: 'Google' },
          { value: 'email', label: 'Email' },
        ]"
      />

      <div v-if="mode === 'google'" class="space-y-3">
        <BaseButton block :disabled="authStore.isLoading" @click="signInGoogle">Continuar con Google</BaseButton>
        <p class="text-xs text-muted">Usa tu cuenta Google para ingresar rápidamente.</p>
        <p v-if="!isSupabaseConfigured" class="rounded-xl border border-warning/40 bg-warning/10 p-2 text-xs text-warning">
          Modo demo activo: configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
        </p>
      </div>

      <div v-else class="space-y-3">
        <BaseInput v-model="form.email" type="email" label="Correo" placeholder="correo@dominio.com" />
        <BaseInput v-model="form.password" type="password" label="Contraseña" placeholder="••••••••" />
        <div class="grid grid-cols-2 gap-2">
          <BaseButton variant="secondary" block @click="signInEmail">Entrar</BaseButton>
          <BaseButton block @click="signUpEmail">Registrar</BaseButton>
        </div>
      </div>

      <p v-if="errorMessage" class="rounded-lg border border-danger/50 bg-danger/10 p-2 text-xs text-danger">
        {{ errorMessage }}
      </p>
    </BaseCard>
  </section>
</template>
