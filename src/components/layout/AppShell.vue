<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'
import BaseButton from '../base/BaseButton.vue'
import BaseToast from '../base/BaseToast.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const links = [
  {
    to: '/',
    label: 'Dashboard',
    icon: ['M3 13l9-9 9 9', 'M5 11v9h14v-9'],
  },
  {
    to: '/accounts',
    label: 'Cuentas',
    icon: ['M3 7h18v10H3z', 'M3 11h18'],
  },
  {
    to: '/categories',
    label: 'Categorías',
    icon: ['M4 5h16v6H4z', 'M4 13h10v6H4z', 'M16 13h4v6h-4z'],
  },
  {
    to: '/transactions',
    label: 'Transacciones',
    icon: ['M4 18l6-6 4 4 6-8'],
  },
  {
    to: '/investments',
    label: 'Inversiones',
    icon: ['M4 19h16', 'M6 15l4-4 3 3 5-6'],
  },
  {
    to: '/loans',
    label: 'Préstamos',
    icon: ['M8 12h8', 'M12 8v8', 'M4 4h16v16H4z'],
  },
  {
    to: '/debts',
    label: 'Deudas',
    icon: ['M7 7h10v10H7z', 'M9 9h6v6H9z'],
  },
  {
    to: '/credit-cards',
    label: 'Tarjetas',
    icon: ['M3 7h18v10H3z', 'M3 11h18', 'M7 15h4'],
  },
  {
    to: '/planning',
    label: 'Planificación',
    icon: ['M4 19V5', 'M10 19V9', 'M16 19V12', 'M22 19V7'],
  },
]

const privacyIconClass = computed(() => (uiStore.hideAmounts ? 'text-warning' : 'text-success'))

function isActive(path) {
  return route.path === path
}

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header class="sticky top-0 z-30 flex items-center justify-between border-b border-surfaceAlt/90 bg-bg/90 px-4 py-3 backdrop-blur-xl">
      <div class="flex items-center gap-3">
        <button class="rounded-xl border border-surfaceAlt bg-surface/70 p-2 text-muted transition hover:text-text lg:hidden" @click="uiStore.toggleDrawer()" aria-label="Abrir menú">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div>
          <p class="text-[11px] uppercase tracking-[0.14em] text-muted">Organizador personal</p>
          <h1 class="text-sm font-semibold tracking-wide text-text">My Wallet</h1>
        </div>
      </div>
      <button class="rounded-xl border border-surfaceAlt bg-surface/75 p-2 transition" :class="privacyIconClass" @click="uiStore.toggleAmounts()" aria-label="Ocultar o mostrar montos">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </header>

    <div class="flex">
      <aside
        class="fixed inset-y-0 left-0 z-40 flex h-screen w-[17rem] flex-col border-r border-surfaceAlt/90 bg-sidebar p-4 transition-transform lg:static lg:translate-x-0"
        style="background-color: #1b1f27"
        :class="uiStore.isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <div class="mb-4 rounded-2xl border border-surfaceAlt bg-surface/40 p-3">
          <p class="text-[11px] uppercase tracking-[0.14em] text-muted">Cuenta activa</p>
          <p class="mt-1 truncate text-sm font-medium text-text">{{ authStore.user?.email }}</p>
        </div>

        <nav class="flex-1 space-y-1.5 overflow-y-auto pr-1">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
            :class="isActive(link.to) ? 'border border-primary/35 bg-primary/12 text-primary' : 'border border-transparent text-muted hover:bg-surface hover:text-text'"
            @click="uiStore.closeDrawer()"
          >
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(path, index) in link.icon" :key="index" :d="path" />
            </svg>
            <span>{{ link.label }}</span>
          </RouterLink>
        </nav>

        <div class="mt-auto subtle-divider" />
        <div class="pt-4">
          <BaseButton variant="ghost" block @click="logout">
            <span class="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Salir
            </span>
          </BaseButton>
        </div>
      </aside>

      <div v-if="uiStore.isDrawerOpen" class="fixed inset-0 z-20 bg-black/60 lg:hidden" @click="uiStore.closeDrawer()" />

      <main class="w-full p-4 lg:p-6 xl:p-8">
        <RouterView />
      </main>
    </div>

    <BaseToast />
  </div>
</template>
