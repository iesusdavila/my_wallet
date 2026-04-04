import { createCrudStore } from './createCrudStore'

export const useAccountsStore = createCrudStore('accounts', 'accounts')
