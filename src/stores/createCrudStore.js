import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export function createCrudStore(storeId, table, defaultOrder = 'created_at') {
  return defineStore(storeId, {
    state: () => ({
      rows: [],
      loading: false,
    }),
    actions: {
      async fetchAll({ filters = [], orderBy = defaultOrder, ascending = false } = {}) {
        this.loading = true
        try {
          const authStore = useAuthStore()
          if (!authStore.user) return

          let query = supabase.from(table).select('*').eq('user_id', authStore.user.id)
          filters.forEach((filter) => {
            query = query[filter.op || 'eq'](filter.field, filter.value)
          })
          if (orderBy) {
            query = query.order(orderBy, { ascending })
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
        const dataToInsert = {
          ...payload,
          user_id: authStore.user.id,
        }
        const { data, error } = await supabase.from(table).insert(dataToInsert).select('*').single()
        if (error) throw error
        this.rows.unshift(data)
        return data
      },
      async update(id, payload) {
        const { data, error } = await supabase
          .from(table)
          .update(payload)
          .eq('id', id)
          .select('*')
          .single()
        if (error) throw error
        this.rows = this.rows.map((row) => (row.id === id ? data : row))
        return data
      },
      async remove(id) {
        const { error } = await supabase.from(table).delete().eq('id', id)
        if (error) throw error
        this.rows = this.rows.filter((row) => row.id !== id)
      },
    },
  })
}