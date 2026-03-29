import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const initialized = ref(false)
  const hideAmounts = ref(true)
  let authListener = null

  const isAuthenticated = computed(() => Boolean(user.value))
  const username = computed(() => profile.value?.username ?? '')

  const loadProfile = async (userId) => {
    if (!userId) {
      profile.value = null
      return
    }

    if (!isSupabaseConfigured) {
      const local = localStorage.getItem('wallet_demo_profile')
      profile.value = local ? JSON.parse(local) : { user_id: userId, username: '' }
      return
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      profile.value = { user_id: userId, username: '' }
      return
    }

    profile.value = data
  }

  const setUsername = async (value) => {
    const clean = value?.trim()
    if (!user.value?.id || !clean) {
      return
    }

    if (!isSupabaseConfigured) {
      profile.value = { user_id: user.value.id, username: clean }
      localStorage.setItem('wallet_demo_profile', JSON.stringify(profile.value))
      return
    }

    const payload = {
      user_id: user.value.id,
      username: clean,
      email: user.value.email,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' })
    if (error) {
      throw error
    }

    await loadProfile(user.value.id)
  }

  const init = async () => {
    if (initialized.value) {
      return
    }

    if (!isSupabaseConfigured) {
      const demoUser = localStorage.getItem('wallet_demo_user')
      if (demoUser) {
        user.value = JSON.parse(demoUser)
        await loadProfile(user.value.id)
      }
      initialized.value = true
      return
    }

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    await loadProfile(user.value?.id)

    const response = supabase.auth.onAuthStateChange(async (_event, session) => {
      user.value = session?.user ?? null
      await loadProfile(user.value?.id)
    })

    authListener = response.data.subscription
    initialized.value = true
  }

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      const demo = { id: 'demo-user', email: 'demo@wallet.app' }
      localStorage.setItem('wallet_demo_user', JSON.stringify(demo))
      user.value = demo
      await loadProfile(demo.id)
      return
    }

    isLoading.value = true
    const redirectTo = `${window.location.origin}/`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    isLoading.value = false

    if (error) {
      throw error
    }
  }

  const signInWithEmail = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      const demo = { id: 'demo-user', email }
      localStorage.setItem('wallet_demo_user', JSON.stringify(demo))
      user.value = demo
      await loadProfile(demo.id)
      return
    }

    isLoading.value = true
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    isLoading.value = false

    if (error) {
      throw error
    }
  }

  const signUpWithEmail = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      const demo = { id: 'demo-user', email }
      localStorage.setItem('wallet_demo_user', JSON.stringify(demo))
      user.value = demo
      await loadProfile(demo.id)
      return
    }

    isLoading.value = true
    const { error } = await supabase.auth.signUp({ email, password })
    isLoading.value = false

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('wallet_demo_user')
      localStorage.removeItem('wallet_demo_profile')
      user.value = null
      profile.value = null
      return
    }

    await supabase.auth.signOut()
    profile.value = null
  }

  const toggleHideAmounts = () => {
    hideAmounts.value = !hideAmounts.value
  }

  const destroy = () => {
    authListener?.unsubscribe()
  }

  return {
    user,
    profile,
    isLoading,
    initialized,
    hideAmounts,
    isAuthenticated,
    username,
    init,
    loadProfile,
    setUsername,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    toggleHideAmounts,
    destroy,
  }
})
