const ICON_KEY = 'wallet_category_icons_v1'
const COLOR_KEY = 'wallet_category_colors_v1'

export const CATEGORY_ICON_OPTIONS = [
  { value: 'food', label: 'Comida', paths: ['M4 7h16', 'M7 7v12', 'M17 7v12', 'M9 12h6'] },
  { value: 'transport', label: 'Transporte', paths: ['M5 16V8l7-3 7 3v8', 'M5 12h14', 'M8 16a1 1 0 1 0 0 .01', 'M16 16a1 1 0 1 0 0 .01'] },
  { value: 'home', label: 'Casa', paths: ['M3 11l9-7 9 7', 'M6 10v10h12V10'] },
  { value: 'health', label: 'Salud', paths: ['M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z', 'M12 8v6', 'M9 11h6'] },
  { value: 'salary', label: 'Sueldo', paths: ['M4 8h16v8H4z', 'M8 12h8', 'M12 8v8'] },
  { value: 'shopping', label: 'Compras', paths: ['M6 7h12l-1 12H7L6 7z', 'M9 7a3 3 0 0 1 6 0'] },
  { value: 'education', label: 'Educación', paths: ['M3 8l9-4 9 4-9 4-9-4z', 'M6 10v5c2 2 10 2 12 0v-5'] },
  { value: 'entertainment', label: 'Ocio', paths: ['M7 5h10v14H7z', 'M10 9h4', 'M10 13h4'] },
  { value: 'services', label: 'Servicios', paths: ['M4 12h16', 'M12 4v16', 'M6 6l12 12', 'M18 6L6 18'] },
  { value: 'savings', label: 'Ahorro', paths: ['M4 11h16', 'M6 11v8h12v-8', 'M9 7h6', 'M12 7V4'] },
  { value: 'pet', label: 'Mascotas', paths: ['M7 12a2 2 0 1 0 0 .01', 'M11 9a2 2 0 1 0 0 .01', 'M15 9a2 2 0 1 0 0 .01', 'M17 12a2 2 0 1 0 0 .01', 'M9 17c1.5 2 4.5 2 6 0'] },
  { value: 'gift', label: 'Regalos', paths: ['M3 10h18v10H3z', 'M12 10v10', 'M3 7h18v3', 'M12 7c0-2-2-3-3-3s-2 1-2 2 1 1 2 1h3zm0 0c0-2 2-3 3-3s2 1 2 2-1 1-2 1h-3z'] },
  { value: 'travel', label: 'Viaje', paths: ['M4 14l16-4', 'M6 9l8 8', 'M3 18l4-1', 'M17 5l2 2'] },
  { value: 'phone', label: 'Móvil', paths: ['M8 3h8v18H8z', 'M11 6h2', 'M10 18h4'] },
  { value: 'sport', label: 'Deporte', paths: ['M5 12h14', 'M12 5a7 7 0 0 0 0 14', 'M12 5a7 7 0 0 1 0 14'] },
]

export const CATEGORY_COLOR_OPTIONS = [
  { value: 'slateBlue', label: 'Slate Blue', className: 'bg-[#2f3b50] text-[#b8c8e8] border-[#4b5f84]' },
  { value: 'dustyPurple', label: 'Dusty Purple', className: 'bg-[#3d3448] text-[#d7bfe8] border-[#6e5a84]' },
  { value: 'tealSmoke', label: 'Teal Smoke', className: 'bg-[#2f4541] text-[#b7e2d5] border-[#4f7c74]' },
  { value: 'warmBrown', label: 'Warm Brown', className: 'bg-[#4a3c32] text-[#e7c8ac] border-[#7c654f]' },
  { value: 'violetGray', label: 'Violet Gray', className: 'bg-[#3b2f3f] text-[#dfbddf] border-[#6a4d72]' },
  { value: 'blueGray', label: 'Blue Gray', className: 'bg-[#2e3f4a] text-[#b8d6e6] border-[#4b7083]' },
  { value: 'roseSmoke', label: 'Rose Smoke', className: 'bg-[#483a3a] text-[#e7c1c1] border-[#7b5a5a]' },
  { value: 'greenStone', label: 'Green Stone', className: 'bg-[#334238] text-[#c3e0c8] border-[#587662]' },
  { value: 'lavenderFog', label: 'Lavender Fog', className: 'bg-[#3c3950] text-[#d0caee] border-[#635f87]' },
  { value: 'sandOlive', label: 'Sand Olive', className: 'bg-[#4b4633] text-[#e5dcba] border-[#7d7354]' },
  { value: 'mossDark', label: 'Moss Dark', className: 'bg-[#39432f] text-[#d2e4bb] border-[#63784d]' },
  { value: 'wineSoft', label: 'Wine Soft', className: 'bg-[#4a303a] text-[#e6bfd0] border-[#7d4f60]' },
  { value: 'storm', label: 'Storm', className: 'bg-[#313845] text-[#c4d2e8] border-[#505f7d]' },
  { value: 'copperDark', label: 'Copper Dark', className: 'bg-[#4a352f] text-[#e7c3b2] border-[#7d584d]' },
  { value: 'indigoDust', label: 'Indigo Dust', className: 'bg-[#343550] text-[#c9caee] border-[#5d5f86]' },
]

const defaultByType = {
  expense: 'shopping',
  income: 'salary',
}

function readMap() {
  try {
    return JSON.parse(localStorage.getItem(ICON_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeMap(value) {
  localStorage.setItem(ICON_KEY, JSON.stringify(value))
}

function readColorMap() {
  try {
    return JSON.parse(localStorage.getItem(COLOR_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeColorMap(value) {
  localStorage.setItem(COLOR_KEY, JSON.stringify(value))
}

export function setCategoryIcon(categoryId, iconValue) {
  if (!categoryId) return
  const map = readMap()
  map[categoryId] = iconValue
  writeMap(map)
}

export function removeCategoryIcon(categoryId) {
  const map = readMap()
  delete map[categoryId]
  writeMap(map)
}

export function setCategoryColor(categoryId, colorValue) {
  if (!categoryId) return
  const map = readColorMap()
  map[categoryId] = colorValue
  writeColorMap(map)
}

export function removeCategoryColor(categoryId) {
  const map = readColorMap()
  delete map[categoryId]
  writeColorMap(map)
}

export function getCategoryIconValue(category) {
  const map = readMap()
  const mapped = map[category?.id]
  if (mapped) return mapped

  const name = (category?.name || '').toLowerCase()
  if (name.includes('comida')) return 'food'
  if (name.includes('trans')) return 'transport'
  if (name.includes('casa') || name.includes('hogar')) return 'home'
  if (name.includes('salud')) return 'health'
  if (name.includes('sueldo') || name.includes('salario')) return 'salary'
  if (name.includes('educ')) return 'education'
  if (name.includes('ahorro')) return 'savings'

  return defaultByType[category?.type] || 'services'
}

export function getCategoryIcon(category) {
  const value = getCategoryIconValue(category)
  return CATEGORY_ICON_OPTIONS.find((item) => item.value === value) || CATEGORY_ICON_OPTIONS[0]
}

export function getCategoryColorValue(category) {
  const map = readColorMap()
  const mapped = map[category?.id]
  if (mapped) return mapped
  return category?.type === 'income' ? 'greenStone' : 'slateBlue'
}

export function getCategoryColorClass(category) {
  const value = getCategoryColorValue(category)
  return CATEGORY_COLOR_OPTIONS.find((item) => item.value === value)?.className || CATEGORY_COLOR_OPTIONS[0].className
}
