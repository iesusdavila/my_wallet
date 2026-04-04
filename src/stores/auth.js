import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async init() {
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      this.user = data.session?.user || null

      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session
        this.user = session?.user || null
      })
    },
    async register(email, password, username) {
      this.loading = true
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        })
        if (error) throw error
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async login(email, password) {
      this.loading = true
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return { ok: true }
      } catch (error) {
        return { ok: false, error: error.message }
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await supabase.auth.signOut()
    },
  },
})
