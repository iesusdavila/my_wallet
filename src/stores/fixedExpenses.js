import { createCrudStore } from './createCrudStore'

export const useFixedExpensesStore = createCrudStore('fixedExpenses', 'fixed_expenses')
