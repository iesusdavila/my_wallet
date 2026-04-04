import { createCrudStore } from './createCrudStore'

export const useGoalsStore = createCrudStore('goals', 'goals')
