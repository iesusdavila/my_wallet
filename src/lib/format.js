import { useUiStore } from '../stores/ui'

export function formatMoney(value) {
  const uiStore = useUiStore()
  if (uiStore.hideAmounts) return '••••'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export function currentMonthValue() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}
