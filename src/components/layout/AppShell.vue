<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFinanceStore } from '@/stores/finance'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const authStore = useAuthStore()
const financeStore = useFinanceStore()
const drawerOpen = ref(false)
const showProfileModal = ref(false)
const usernameForm = reactive({ username: '' })

const menu = [
  { path: '/', label: 'Inicio', icon: '◉' },
  { path: '/transacciones', label: 'Transacciones', icon: '⇄' },
  { path: '/cuentas', label: 'Cuentas', icon: '◌' },
  { path: '/categorias', label: 'Categorías', icon: '◈' },
  { path: '/deudas', label: 'Deudas', icon: '⌁' },
  { path: '/inversiones', label: 'Inversiones', icon: '⟁' },
  { path: '/planificacion', label: 'Planificación', icon: '◍' },
  { path: '/prestamos', label: 'Préstamos', icon: '◎' },
  { path: '/reportes', label: 'Reportes', icon: '▦' },
  { path: '/ajustes', label: 'Ajustes', icon: '⚙' },
]

const pageTitle = computed(() => {
  const active = menu.find((item) => item.path === route.path)
  return active?.label ?? 'Mi Billetera'
})

const isUsernameMissing = computed(() => authStore.isAuthenticated && !authStore.username)

const syncUserFinance = async () => {
  await financeStore.initForUser(authStore.user?.id)
  showProfileModal.value = Boolean(isUsernameMissing.value)
}

const saveUsername = async () => {
  if (!usernameForm.username.trim()) {
    return
  }

  await authStore.setUsername(usernameForm.username)
  showProfileModal.value = false
}

onMounted(syncUserFinance)

watch(
  () => authStore.user?.id,
  async () => {
    await syncUserFinance()
  },
)
</script>

<template>
  <div class="mx-auto min-h-svh w-full max-w-6xl border-x border-border bg-bg/80 backdrop-blur-sm">
    <header class="sticky top-0 z-40 border-b border-border/70 bg-bg/90 px-4 py-3 backdrop-blur">
      <div class="mx-auto flex items-center justify-between gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-text transition hover:border-primary/35"
          @click="drawerOpen = true"
        >
          <span class="text-[11px]">☰</span>
          <span>Menú</span>
        </button>

        <div class="min-w-0 text-center">
          <p class="truncate text-sm font-semibold tracking-tight text-text">{{ pageTitle }}</p>
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-xl border bg-surface px-3 py-2 text-xs font-medium text-text transition hover:border-primary/35"
          :class="authStore.hideAmounts ? 'border-warning/50 bg-warning/10 text-warning' : 'border-success/50 bg-success/10 text-success'"
          @click="authStore.toggleHideAmounts"
          :aria-label="authStore.hideAmounts ? 'Mostrar montos' : 'Ocultar montos'"
          :title="authStore.hideAmounts ? 'Mostrar montos' : 'Ocultar montos'"
        >
          <svg v-if="authStore.hideAmounts" viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
            <path d="M3 3 21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M6.2 6.2C4.3 7.6 3 9.5 2.3 12c1.8 5.8 7.4 8.9 12.5 7.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <path d="M10 4.2c6.1-1 11 3 11.7 7.8a11.8 11.8 0 0 1-2.5 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
            <path d="M2.2 12C3.9 6.9 8.2 4 12 4s8.1 2.9 9.8 8c-1.7 5.1-6 8-9.8 8s-8.1-2.9-9.8-8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <span class="hidden sm:inline">{{ authStore.hideAmounts ? 'Mostrar' : 'Ocultar' }}</span>
        </button>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <BaseDrawer :open="drawerOpen" @close="drawerOpen = false">
      <div class="flex h-full flex-col gap-4">
        <div class="rounded-2xl border border-border bg-surface-2 p-3">
          <p class="text-xs text-muted">Cuenta activa</p>
          <p class="mt-1 truncate text-sm font-medium text-text">{{ authStore.user?.email }}</p>
          <p v-if="authStore.username" class="mt-1 text-xs text-primary">@{{ authStore.username }}</p>
        </div>

        <nav class="custom-scrollbar flex-1 overflow-y-auto">
          <ul class="flex list-none flex-col gap-2 p-0">
            <li v-for="item in menu" :key="item.path">
              <RouterLink
                :to="item.path"
                class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition"
                :class="
                  route.path === item.path
                    ? 'border-primary/60 bg-primary/20 text-primary'
                    : 'border-border bg-surface text-text hover:border-primary/35 hover:bg-surface-2'
                "
                @click="drawerOpen = false"
              >
                <span class="text-xs">{{ item.icon }}</span>
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <BaseButton variant="secondary" block @click="authStore.signOut()">Cerrar sesión</BaseButton>
      </div>
    </BaseDrawer>

    <BaseModal :open="showProfileModal" title="Completa tu perfil" @close="() => {}">
      <div class="space-y-3">
        <p class="text-xs text-muted">Antes de continuar, define tu nombre de usuario.</p>
        <BaseInput v-model="usernameForm.username" label="Nombre de usuario" placeholder="Ej. iesus" />
        <BaseButton block @click="saveUsername">Guardar usuario</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
