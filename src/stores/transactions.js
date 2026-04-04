import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    rows: [],
    loading: false,
  }),
  getters: {
    incomeTotal: (state) => state.rows.filter((row) => row.type === 'income').reduce((acc, row) => acc + Number(row.amount || 0), 0),
    expenseTotal: (state) => state.rows.filter((row) => row.type === 'expense').reduce((acc, row) => acc + Number(row.amount || 0), 0),
  },
  actions: {
    async fetchAll({ startDate, endDate, type = 'all', accountId = '', categoryId = '' } = {}) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.user) return

        let query = supabase
          .from('transactions')
          .select(
            '*, categories(name,type), account:accounts!transactions_account_id_fkey(name), destination_account:accounts!transactions_destination_account_id_fkey(name)',
          )
          .eq('user_id', authStore.user.id)
          .order('date', { ascending: false })

        if (startDate) {
          query = query.gte('date', startDate)
        }

        if (endDate) {
          query = query.lte('date', endDate)
        }

        if (type && type !== 'all') {
          query = query.eq('type', type)
        }

        if (accountId) {
          query = query.eq('account_id', accountId)
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query
        if (error) throw error
        this.rows = data || []
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const authStore = useAuthStore()
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...payload, user_id: authStore.user.id })
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    async remove(id) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
  },
})
