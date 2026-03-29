import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppShell from '@/components/layout/AppShell.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TransactionsView from '@/views/TransactionsView.vue'
import AccountsView from '@/views/AccountsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import DebtsView from '@/views/DebtsView.vue'
import InvestmentsView from '@/views/InvestmentsView.vue'
import PlanningView from '@/views/PlanningView.vue'
import LoansView from '@/views/LoansView.vue'
import ReportsView from '@/views/ReportsView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      { path: 'transacciones', name: 'transactions', component: TransactionsView },
      { path: 'cuentas', name: 'accounts', component: AccountsView },
      { path: 'categorias', name: 'categories', component: CategoriesView },
      { path: 'deudas', name: 'debts', component: DebtsView },
      { path: 'inversiones', name: 'investments', component: InvestmentsView },
      { path: 'planificacion', name: 'planning', component: PlanningView },
      { path: 'prestamos', name: 'loans', component: LoansView },
      { path: 'reportes', name: 'reports', component: ReportsView },
      { path: 'ajustes', name: 'settings', component: SettingsView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.init()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
