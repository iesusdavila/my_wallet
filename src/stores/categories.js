import { createCrudStore } from './createCrudStore'

export const useCategoriesStore = createCrudStore('categories', 'categories', 'name')
