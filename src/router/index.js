import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AccountsView from '../views/AccountsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import InvestmentsView from '../views/InvestmentsView.vue'
import LoansView from '../views/LoansView.vue'
import DebtsView from '../views/DebtsView.vue'
import CreditCardsView from '../views/CreditCardsView.vue'
import PlanningView from '../views/PlanningView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    {
      path: '/',
      component: AppShell,
      meta: { requiresAuth: true },
      children: [
        { path: '', component: DashboardView },
        { path: '/accounts', component: AccountsView },
        { path: '/categories', component: CategoriesView },
        { path: '/transactions', component: TransactionsView },
        { path: '/investments', component: InvestmentsView },
        { path: '/loans', component: LoansView },
        { path: '/debts', component: DebtsView },
        { path: '/credit-cards', component: CreditCardsView },
        { path: '/planning', component: PlanningView },
      ],
    },
  ],
})

let authInitialized = false
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authInitialized) {
    await authStore.init()
    authInitialized = true
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }

  return true
})

export default router
