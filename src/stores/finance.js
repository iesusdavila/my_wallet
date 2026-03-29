import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

const nowIso = () => new Date().toISOString()

const createId = () => crypto.randomUUID()

const initialState = {
  accounts: [],
  categories: [],
  transactions: [],
  debts: [],
  creditCards: [],
  loansGiven: [],
  investments: [],
  savingsProducts: [],
  budgets: [],
  goals: [],
  subscriptions: [],
  recurringTemplates: [],
}

const nextDate = (date, frequency) => {
  const next = new Date(date)

  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  }

  if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14)
  }

  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
  }

  if (frequency === 'yearly') {
    next.setFullYear(next.getFullYear() + 1)
  }

  return next
}

export const useFinanceStore = defineStore('finance', () => {
  const accounts = ref(initialState.accounts)
  const categories = ref(initialState.categories)
  const transactions = ref(initialState.transactions)
  const debts = ref(initialState.debts)
  const creditCards = ref(initialState.creditCards)
  const loansGiven = ref(initialState.loansGiven)
  const investments = ref(initialState.investments)
  const savingsProducts = ref(initialState.savingsProducts)
  const budgets = ref(initialState.budgets)
  const goals = ref(initialState.goals)
  const subscriptions = ref(initialState.subscriptions)
  const recurringTemplates = ref(initialState.recurringTemplates)
  const currentUserId = ref(null)
  const initializedForUser = ref(false)

  const resetState = () => {
    accounts.value = []
    categories.value = []
    transactions.value = []
    debts.value = []
    creditCards.value = []
    loansGiven.value = []
    investments.value = []
    savingsProducts.value = []
    budgets.value = []
    goals.value = []
    subscriptions.value = []
    recurringTemplates.value = []
  }

  const ensureUser = () => {
    if (!currentUserId.value) {
      throw new Error('Usuario no inicializado')
    }
  }

  const insertRow = async (table, payload) => {
    if (!isSupabaseConfigured || !currentUserId.value) {
      return
    }

    const { error } = await supabase.from(table).insert({ user_id: currentUserId.value, ...payload })
    if (error) {
      console.error(`Error guardando en ${table}:`, error)
    }
  }

  const updateAccountBalance = async (accountId, balance) => {
    if (!isSupabaseConfigured || !currentUserId.value || !accountId) {
      return
    }

    const { error } = await supabase
      .from('accounts')
      .update({ balance: Number(balance || 0) })
      .eq('id', accountId)
      .eq('user_id', currentUserId.value)

    if (error) {
      console.error('Error actualizando saldo de cuenta:', error)
    }
  }

  const updateRow = async (table, id, payload) => {
    if (!isSupabaseConfigured || !currentUserId.value || !id) {
      return
    }

    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .eq('user_id', currentUserId.value)

    if (error) {
      console.error(`Error actualizando ${table}:`, error)
    }
  }

  const deleteRow = async (table, id) => {
    if (!isSupabaseConfigured || !currentUserId.value || !id) {
      return
    }

    const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', currentUserId.value)
    if (error) {
      console.error(`Error eliminando ${table}:`, error)
    }
  }

  const loadFromSupabase = async () => {
    if (!isSupabaseConfigured || !currentUserId.value) {
      return
    }

    const [
      accountsResult,
      categoriesResult,
      transactionsResult,
      debtsResult,
      creditCardsResult,
      loansResult,
      investmentsResult,
      budgetsResult,
      goalsResult,
      subscriptionsResult,
      recurringResult,
    ] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', currentUserId.value),
      supabase.from('categories').select('*').eq('user_id', currentUserId.value),
      supabase.from('transactions').select('*').eq('user_id', currentUserId.value).order('date', { ascending: false }),
      supabase.from('debts').select('*').eq('user_id', currentUserId.value),
      supabase.from('credit_cards').select('*').eq('user_id', currentUserId.value),
      supabase.from('loans_given').select('*').eq('user_id', currentUserId.value),
      supabase.from('investments').select('*').eq('user_id', currentUserId.value),
      supabase.from('budgets').select('*').eq('user_id', currentUserId.value),
      supabase.from('goals').select('*').eq('user_id', currentUserId.value),
      supabase.from('subscriptions').select('*').eq('user_id', currentUserId.value),
      supabase.from('recurring_templates').select('*').eq('user_id', currentUserId.value),
    ])

    accounts.value = (accountsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      balance: Number(item.balance || 0),
      color: item.color || '#8ab4f8',
    }))

    categories.value = (categoriesResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
    }))

    transactions.value = (transactionsResult.data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      amount: Number(item.amount || 0),
      categoryId: item.category_id,
      accountId: item.account_id,
      destinationAccountId: item.destination_account_id,
      date: item.date,
      description: item.description,
      createdAt: item.created_at,
    }))

    debts.value = (debtsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      balance: Number(item.balance || 0),
      interestRate: Number(item.interest_rate || 0),
      dueDate: item.due_date,
    }))

    creditCards.value = (creditCardsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      outstanding: Number(item.outstanding || 0),
      creditLimit: Number(item.credit_limit || 0),
      closingDay: Number(item.closing_day || 1),
      dueDay: Number(item.due_day || 1),
      monthlyRate: Number(item.monthly_rate || 0),
    }))

    loansGiven.value = (loansResult.data ?? []).map((item) => ({
      id: item.id,
      person: item.person,
      amount: Number(item.amount || 0),
      paid: Number(item.paid || 0),
      description: item.description,
      createdAt: item.created_at?.slice(0, 10),
    }))

    investments.value = (investmentsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      contributions: Number(item.contributions || 0),
      withdrawals: Number(item.withdrawals || 0),
      currentValue: Number(item.current_value || 0),
      updatedAt: item.updated_at?.slice(0, 10),
    }))

    budgets.value = (budgetsResult.data ?? []).map((item) => ({
      id: item.id,
      scope: item.scope,
      scopeId: item.scope_id,
      name: item.name,
      monthlyLimit: Number(item.monthly_limit || 0),
      spent: Number(item.spent || 0),
    }))

    goals.value = (goalsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      targetAmount: Number(item.target_amount || 0),
      savedAmount: Number(item.saved_amount || 0),
      interestRate: Number(item.interest_rate || 0),
      deadline: item.deadline,
    }))

    subscriptions.value = (subscriptionsResult.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      amount: Number(item.amount || 0),
      cadence: item.cadence,
      nextChargeDate: item.next_charge_date,
    }))

    recurringTemplates.value = (recurringResult.data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      amount: Number(item.amount || 0),
      categoryId: item.category_id,
      accountId: item.account_id,
      frequency: item.frequency,
      dayOfMonth: item.day_of_month,
      active: item.active,
      lastGeneratedAt: item.last_generated_at,
    }))
  }

  const initForUser = async (userId) => {
    if (!userId) {
      currentUserId.value = null
      initializedForUser.value = false
      resetState()
      return
    }

    if (initializedForUser.value && currentUserId.value === userId) {
      return
    }

    currentUserId.value = userId
    resetState()

    if (isSupabaseConfigured) {
      await loadFromSupabase()
    }

    initializedForUser.value = true
  }

  const addAccount = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    accounts.value.unshift(item)
    insertRow('accounts', {
      id: item.id,
      name: item.name,
      type: item.type,
      balance: Number(item.balance || 0),
      color: item.color || '#8ab4f8',
    })
  }

  const addCategory = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    categories.value.unshift(item)
    insertRow('categories', {
      id: item.id,
      name: item.name,
      type: item.type,
    })
  }

  const deleteCategory = async (categoryId) => {
    const hasUsage = transactions.value.some((item) => item.categoryId === categoryId)
    if (hasUsage) {
      throw new Error('No puedes eliminar una categoría ya usada en transacciones.')
    }

    categories.value = categories.value.filter((item) => item.id !== categoryId)

    if (isSupabaseConfigured && currentUserId.value) {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId).eq('user_id', currentUserId.value)
      if (error) {
        throw error
      }
    }
  }

  const addTransaction = (payload) => {
    ensureUser()
    const item = { id: createId(), createdAt: nowIso(), ...payload }
    transactions.value.unshift(item)

    insertRow('transactions', {
      id: item.id,
      type: item.type,
      amount: Number(item.amount || 0),
      category_id: item.categoryId,
      account_id: item.accountId,
      destination_account_id: item.destinationAccountId,
      date: item.date,
      description: item.description,
      created_at: item.createdAt,
    })

    if (payload.type === 'income') {
      const account = accounts.value.find((item) => item.id === payload.accountId)
      if (account) {
        account.balance += Number(payload.amount)
        updateAccountBalance(account.id, account.balance)
      }
    }

    if (payload.type === 'expense') {
      const account = accounts.value.find((item) => item.id === payload.accountId)
      if (account) {
        account.balance -= Number(payload.amount)
        updateAccountBalance(account.id, account.balance)
      }
    }

    if (payload.type === 'transfer') {
      const source = accounts.value.find((item) => item.id === payload.accountId)
      const destination = accounts.value.find((item) => item.id === payload.destinationAccountId)
      if (source) {
        source.balance -= Number(payload.amount)
        updateAccountBalance(source.id, source.balance)
      }
      if (destination) {
        destination.balance += Number(payload.amount)
        updateAccountBalance(destination.id, destination.balance)
      }
    }
  }

  const addLoanGiven = (payload) => {
    ensureUser()
    const item = {
      id: createId(),
      paid: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      ...payload,
    }

    loansGiven.value.unshift(item)

    insertRow('loans_given', {
      id: item.id,
      person: item.person,
      amount: Number(item.amount || 0),
      paid: Number(item.paid || 0),
      description: item.description,
      created_at: item.createdAt,
    })
  }

  const addDebt = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    debts.value.unshift(item)

    insertRow('debts', {
      id: item.id,
      name: item.name,
      balance: Number(item.balance || 0),
      interest_rate: Number(item.interestRate || 0),
      due_date: item.dueDate,
    })
  }

  const addCreditCard = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    creditCards.value.unshift(item)

    insertRow('credit_cards', {
      id: item.id,
      name: item.name,
      outstanding: Number(item.outstanding || 0),
      credit_limit: Number(item.creditLimit || 0),
      closing_day: Number(item.closingDay || 1),
      due_day: Number(item.dueDay || 1),
      monthly_rate: Number(item.monthlyRate || 0),
    })
  }

  const addInvestment = (payload) => {
    ensureUser()
    const item = {
      id: createId(),
      updatedAt: new Date().toISOString().slice(0, 10),
      ...payload,
    }

    investments.value.unshift(item)

    insertRow('investments', {
      id: item.id,
      name: item.name,
      contributions: Number(item.contributions || 0),
      withdrawals: Number(item.withdrawals || 0),
      current_value: Number(item.currentValue || 0),
      updated_at: item.updatedAt,
    })
  }

  const addBudget = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    budgets.value.unshift(item)

    insertRow('budgets', {
      id: item.id,
      scope: item.scope,
      scope_id: item.scopeId,
      name: item.name,
      monthly_limit: Number(item.monthlyLimit || 0),
      spent: Number(item.spent || 0),
    })
  }

  const addGoal = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    goals.value.unshift(item)

    insertRow('goals', {
      id: item.id,
      name: item.name,
      target_amount: Number(item.targetAmount || 0),
      saved_amount: Number(item.savedAmount || 0),
      interest_rate: Number(item.interestRate || 0),
      deadline: item.deadline,
    })
  }

  const updateBudget = (id, payload) => {
    const item = budgets.value.find((budget) => budget.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('budgets', id, {
      name: item.name,
      scope: item.scope,
      scope_id: item.scopeId,
      monthly_limit: Number(item.monthlyLimit || 0),
      spent: Number(item.spent || 0),
    })
  }

  const deleteBudget = (id) => {
    budgets.value = budgets.value.filter((item) => item.id !== id)
    deleteRow('budgets', id)
  }

  const updateGoal = (id, payload) => {
    const item = goals.value.find((goal) => goal.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('goals', id, {
      name: item.name,
      target_amount: Number(item.targetAmount || 0),
      saved_amount: Number(item.savedAmount || 0),
      interest_rate: Number(item.interestRate || 0),
      deadline: item.deadline,
    })
  }

  const deleteGoal = (id) => {
    goals.value = goals.value.filter((item) => item.id !== id)
    deleteRow('goals', id)
  }

  const updateSubscription = (id, payload) => {
    const item = subscriptions.value.find((subscription) => subscription.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('subscriptions', id, {
      name: item.name,
      amount: Number(item.amount || 0),
      cadence: item.cadence,
      next_charge_date: item.nextChargeDate,
    })
  }

  const deleteSubscription = (id) => {
    subscriptions.value = subscriptions.value.filter((item) => item.id !== id)
    deleteRow('subscriptions', id)
  }

  const updateDebt = (id, payload) => {
    const item = debts.value.find((debt) => debt.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('debts', id, {
      name: item.name,
      balance: Number(item.balance || 0),
      interest_rate: Number(item.interestRate || 0),
      due_date: item.dueDate,
    })
  }

  const deleteDebt = (id) => {
    debts.value = debts.value.filter((item) => item.id !== id)
    deleteRow('debts', id)
  }

  const updateCreditCard = (id, payload) => {
    const item = creditCards.value.find((card) => card.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('credit_cards', id, {
      name: item.name,
      outstanding: Number(item.outstanding || 0),
      credit_limit: Number(item.creditLimit || 0),
      closing_day: Number(item.closingDay || 1),
      due_day: Number(item.dueDay || 1),
      monthly_rate: Number(item.monthlyRate || 0),
    })
  }

  const deleteCreditCard = (id) => {
    creditCards.value = creditCards.value.filter((item) => item.id !== id)
    deleteRow('credit_cards', id)
  }

  const updateAccount = (id, payload) => {
    const item = accounts.value.find((account) => account.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('accounts', id, {
      name: item.name,
      type: item.type,
      balance: Number(item.balance || 0),
      color: item.color || '#8ab4f8',
    })
  }

  const deleteAccount = (id) => {
    accounts.value = accounts.value.filter((item) => item.id !== id)
    deleteRow('accounts', id)
  }

  const updateInvestment = (id, payload) => {
    const item = investments.value.find((investment) => investment.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('investments', id, {
      name: item.name,
      contributions: Number(item.contributions || 0),
      withdrawals: Number(item.withdrawals || 0),
      current_value: Number(item.currentValue || 0),
      updated_at: item.updatedAt,
    })
  }

  const deleteInvestment = (id) => {
    investments.value = investments.value.filter((item) => item.id !== id)
    deleteRow('investments', id)
  }

  const updateLoanGiven = (id, payload) => {
    const item = loansGiven.value.find((loan) => loan.id === id)
    if (!item) {
      return
    }

    Object.assign(item, payload)
    updateRow('loans_given', id, {
      person: item.person,
      amount: Number(item.amount || 0),
      paid: Number(item.paid || 0),
      description: item.description,
      created_at: item.createdAt,
    })
  }

  const deleteLoanGiven = (id) => {
    loansGiven.value = loansGiven.value.filter((item) => item.id !== id)
    deleteRow('loans_given', id)
  }

  const updateTransaction = (id, payload) => {
    const item = transactions.value.find((transaction) => transaction.id === id)
    if (!item) {
      return
    }

    // Revertir impacto anterior
    if (item.type === 'income') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance -= Number(item.amount)
      }
    }
    if (item.type === 'expense') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance += Number(item.amount)
      }
    }
    if (item.type === 'transfer') {
      const source = accounts.value.find((acc) => acc.id === item.accountId)
      const destination = accounts.value.find((acc) => acc.id === item.destinationAccountId)
      if (source) {
        source.balance += Number(item.amount)
      }
      if (destination) {
        destination.balance -= Number(item.amount)
      }
    }

    // Aplicar nuevo impacto
    Object.assign(item, payload)
    if (item.type === 'income') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance += Number(item.amount)
      }
    }
    if (item.type === 'expense') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance -= Number(item.amount)
      }
    }
    if (item.type === 'transfer') {
      const source = accounts.value.find((acc) => acc.id === item.accountId)
      const destination = accounts.value.find((acc) => acc.id === item.destinationAccountId)
      if (source) {
        source.balance -= Number(item.amount)
      }
      if (destination) {
        destination.balance += Number(item.amount)
      }
    }

    updateRow('transactions', id, {
      type: item.type,
      amount: Number(item.amount || 0),
      category_id: item.categoryId,
      account_id: item.accountId,
      destination_account_id: item.destinationAccountId,
      date: item.date,
      description: item.description,
    })
  }

  const deleteTransaction = (id) => {
    const item = transactions.value.find((transaction) => transaction.id === id)
    if (!item) {
      return
    }

    // Revertir impacto
    if (item.type === 'income') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance -= Number(item.amount)
      }
    }
    if (item.type === 'expense') {
      const account = accounts.value.find((acc) => acc.id === item.accountId)
      if (account) {
        account.balance += Number(item.amount)
      }
    }
    if (item.type === 'transfer') {
      const source = accounts.value.find((acc) => acc.id === item.accountId)
      const destination = accounts.value.find((acc) => acc.id === item.destinationAccountId)
      if (source) {
        source.balance += Number(item.amount)
      }
      if (destination) {
        destination.balance -= Number(item.amount)
      }
    }

    transactions.value = transactions.value.filter((transaction) => transaction.id !== id)
    deleteRow('transactions', id)
  }

  const addSubscription = (payload) => {
    ensureUser()
    const item = { id: createId(), ...payload }
    subscriptions.value.unshift(item)

    insertRow('subscriptions', {
      id: item.id,
      name: item.name,
      amount: Number(item.amount || 0),
      cadence: item.cadence,
      next_charge_date: item.nextChargeDate,
    })
  }

  const materializeRecurringTransactions = (untilDate = new Date()) => {
    recurringTemplates.value.forEach((template) => {
      if (!template.active) {
        return
      }

      const start = template.lastGeneratedAt ? new Date(template.lastGeneratedAt) : new Date('2026-01-01')
      let next = nextDate(start, template.frequency)

      while (next <= untilDate) {
        addTransaction({
          type: template.type,
          amount: template.amount,
          categoryId: template.categoryId,
          accountId: template.accountId,
          date: next.toISOString().slice(0, 10),
          description: template.description,
        })
        next = nextDate(next, template.frequency)
      }

      template.lastGeneratedAt = untilDate.toISOString()
    })
  }

  const totalBalance = computed(() => accounts.value.reduce((sum, account) => sum + account.balance, 0))
  const totalDebts = computed(
    () =>
      debts.value.reduce((sum, debt) => sum + debt.balance, 0) +
      creditCards.value.reduce((sum, card) => sum + card.outstanding, 0),
  )
  const totalInvestedCapital = computed(
    () => investments.value.reduce((sum, item) => sum + item.contributions - item.withdrawals, 0),
  )
  const totalInvestmentsValue = computed(() => investments.value.reduce((sum, item) => sum + item.currentValue, 0))
  const netWorth = computed(() => totalBalance.value + totalInvestmentsValue.value - totalDebts.value)

  const monthlyIncomeExpense = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)

    const monthlyTransactions = transactions.value.filter((transaction) => transaction.date.startsWith(currentMonth))

    return monthlyTransactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += transaction.amount
        }
        if (transaction.type === 'expense') {
          accumulator.expense += transaction.amount
        }
        return accumulator
      },
      { income: 0, expense: 0 },
    )
  })

  return {
    accounts,
    categories,
    transactions,
    debts,
    creditCards,
    loansGiven,
    investments,
    savingsProducts,
    budgets,
    goals,
    subscriptions,
    recurringTemplates,
    currentUserId,
    initializedForUser,
    totalBalance,
    totalDebts,
    totalInvestedCapital,
    totalInvestmentsValue,
    netWorth,
    monthlyIncomeExpense,
    initForUser,
    resetState,
    addAccount,
    addCategory,
    deleteCategory,
    addTransaction,
    addLoanGiven,
    addInvestment,
    addDebt,
    addCreditCard,
    addBudget,
    addGoal,
    addSubscription,
    updateBudget,
    deleteBudget,
    updateGoal,
    deleteGoal,
    updateSubscription,
    deleteSubscription,
    updateDebt,
    deleteDebt,
    updateCreditCard,
    deleteCreditCard,
    updateAccount,
    deleteAccount,
    updateInvestment,
    deleteInvestment,
    updateLoanGiven,
    deleteLoanGiven,
    updateTransaction,
    deleteTransaction,
    materializeRecurringTransactions,
  }
})
