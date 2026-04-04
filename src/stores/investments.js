import { createCrudStore } from './createCrudStore'

export const useInvestmentsStore = createCrudStore('investments', 'investments')
