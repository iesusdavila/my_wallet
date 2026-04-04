import { defineStore } from 'pinia'

const STORAGE_KEY = 'wallet_privacy_hidden'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isDrawerOpen: false,
    hideAmounts: localStorage.getItem(STORAGE_KEY) === 'true',
    toasts: [],
  }),
  actions: {
    toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen
    },
    closeDrawer() {
      this.isDrawerOpen = false
    },
    toggleAmounts() {
      this.hideAmounts = !this.hideAmounts
      localStorage.setItem(STORAGE_KEY, String(this.hideAmounts))
    },
    showToast(message, type = 'info') {
      const id = crypto.randomUUID()
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
      }, 3000)
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})
