export const formatUSD = (value, hidden = false) => {
  if (hidden) {
    return '••••••'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}
