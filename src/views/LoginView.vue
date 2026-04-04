<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseCard from '../components/base/BaseCard.vue'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

const isRegister = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
})

async function submit() {
  const action = isRegister.value
    ? authStore.register(form.email, form.password, form.username)
    : authStore.login(form.email, form.password)

  const result = await action
  if (!result.ok) {
    uiStore.showToast(result.error || 'No fue posible continuar', 'error')
    return
  }

  uiStore.showToast(isRegister.value ? 'Registro exitoso' : 'Ingreso exitoso', 'success')
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <BaseCard class="w-full max-w-md">
      <h1 class="mb-1 text-xl font-semibold">Finanzas Personales</h1>
      <p class="mb-4 text-sm text-muted">Acceso con email y contraseña</p>

      <form class="space-y-3" @submit.prevent="submit">
        <BaseInput v-if="isRegister" v-model="form.username" label="Nombre de usuario" required />
        <BaseInput v-model="form.email" type="email" label="Email" required />
        <BaseInput v-model="form.password" type="password" label="Contraseña" required />

        <BaseButton type="submit" block :disabled="authStore.loading">
          {{ isRegister ? 'Crear cuenta' : 'Ingresar' }}
        </BaseButton>
      </form>

      <button class="mt-3 text-sm text-primary" @click="isRegister = !isRegister">
        {{ isRegister ? 'Ya tengo cuenta' : 'No tengo cuenta' }}
      </button>
    </BaseCard>
  </div>
</template>
