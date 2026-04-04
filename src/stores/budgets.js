import { createCrudStore } from './createCrudStore'

export const useBudgetsStore = createCrudStore('budgets', 'budgets')
