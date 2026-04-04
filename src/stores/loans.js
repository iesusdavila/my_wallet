import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useLoansStore = defineStore('loans', {
  state: () => ({
    rows: [],
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.user) return
        const { data, error } = await supabase
          .from('loans_given')
          .select('*')
          .eq('user_id', authStore.user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        this.rows = data || []
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const authStore = useAuthStore()
      const { data, error } = await supabase
        .from('loans_given')
        .insert({ ...payload, user_id: authStore.user.id })
        .select('*')
        .single()
      if (error) throw error
      this.rows.unshift(data)
      return data
    },
    async update(id, payload) {
      const { data, error } = await supabase
        .from('loans_given')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
      if (error) throw error
      this.rows = this.rows.map((row) => (row.id === id ? data : row))
      return data
    },
    async remove(id) {
      const { error } = await supabase.from('loans_given').delete().eq('id', id)
      if (error) throw error
      this.rows = this.rows.filter((row) => row.id !== id)
    },
    async markAsPaid({ loan, accountId, categoryId }) {
      const authStore = useAuthStore()
      const descriptionPart = loan.description ? ` - ${loan.description}` : ''
      const note = `Pago recibido de ${loan.person}${descriptionPart}`

      const { error: txError } = await supabase.from('transactions').insert({
        user_id: authStore.user.id,
        type: 'income',
        amount: loan.amount,
        account_id: accountId,
        category_id: categoryId,
        date: new Date().toISOString().slice(0, 10),
        description: note,
      })
      if (txError) throw txError

      const { data, error } = await supabase
        .from('loans_given')
        .update({ paid: true })
        .eq('id', loan.id)
        .select('*')
        .single()
      if (error) throw error
      this.rows = this.rows.map((row) => (row.id === loan.id ? data : row))
      return data
    },
  },
})
