<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BaseCard from '../components/base/BaseCard.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import ActionButtons from '../components/base/ActionButtons.vue'
import { useCategoriesStore } from '../stores/categories'
import { useUiStore } from '../stores/ui'
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  getCategoryColorClass,
  getCategoryColorValue,
  getCategoryIcon,
  getCategoryIconValue,
  removeCategoryColor,
  removeCategoryIcon,
  setCategoryColor,
  setCategoryIcon,
} from '../lib/categoryIcons'

const categoriesStore = useCategoriesStore()
const uiStore = useUiStore()

const open = ref(false)
const editing = ref(null)
const filter = ref('all')

const form = reactive({
  name: '',
  type: 'expense',
  icon: 'shopping',
  color: 'slateBlue',
})

const typeOptions = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
]

const stats = computed(() => ({
  all: categoriesStore.rows.length,
  income: categoriesStore.rows.filter((row) => row.type === 'income').length,
  expense: categoriesStore.rows.filter((row) => row.type === 'expense').length,
}))

const visibleRows = computed(() => {
  if (filter.value === 'all') return categoriesStore.rows
  return categoriesStore.rows.filter((row) => row.type === filter.value)
})

onMounted(() => categoriesStore.fetchAll())

function resetForm() {
  form.name = ''
  form.type = 'expense'
  form.icon = 'shopping'
  form.color = 'slateBlue'
}

function openCreate() {
  editing.value = null
  resetForm()
  open.value = true
}

function openEdit(row) {
  editing.value = row
  form.name = row.name
  form.type = row.type
  form.icon = getCategoryIconValue(row)
  form.color = getCategoryColorValue(row)
  open.value = true
}

async function save() {
  try {
    if (editing.value) {
      await categoriesStore.update(editing.value.id, { name: form.name, type: form.type })
      setCategoryIcon(editing.value.id, form.icon)
      setCategoryColor(editing.value.id, form.color)
      uiStore.showToast('Categoría actualizada', 'success')
    } else {
      const created = await categoriesStore.create({ name: form.name, type: form.type })
      setCategoryIcon(created.id, form.icon)
      setCategoryColor(created.id, form.color)
      uiStore.showToast('Categoría creada', 'success')
    }
    open.value = false
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

async function remove(id) {
  try {
    await categoriesStore.remove(id)
    removeCategoryIcon(id)
    removeCategoryColor(id)
    uiStore.showToast('Categoría eliminada', 'success')
  } catch (error) {
    uiStore.showToast(error.message, 'error')
  }
}

function typeLabel(type) {
  return type === 'income' ? 'Ingreso' : 'Gasto'
}

function typeChipClass(type) {
  return type === 'income'
    ? 'bg-[#1d4a39] text-[#98f0c6] border-[#2b7a5c]'
    : 'bg-[#57212f] text-[#ffb3c7] border-[#8b3d52]'
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="section-title">Categorías</h2>
      <BaseButton aria-label="Nueva categoría" title="Nueva categoría" @click="openCreate">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </BaseButton>
    </div>

    <BaseCard>
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Filtros</p>
        <p class="text-xs text-muted">{{ stats.all }} categorías</p>
      </div>

      <div class="mt-3 flex justify-center">
        <div class="relative inline-grid grid-cols-3 rounded-full border border-surfaceAlt bg-surfaceAlt/40 p-1">
          <span
            class="absolute top-1 h-[calc(100%-0.5rem)] w-[calc((100%-0.5rem)/3)] rounded-full bg-primary/25 shadow-soft transition-transform duration-200"
            :class="filter === 'all' ? 'translate-x-0 left-1' : filter === 'income' ? 'left-1 translate-x-full' : 'left-1 translate-x-[200%]'"
          />
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-xs font-medium transition"
            :class="filter === 'all' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'all'"
          >
            Todas ({{ stats.all }})
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-xs font-medium transition"
            :class="filter === 'income' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'income'"
          >
            Ingresos ({{ stats.income }})
          </button>
          <button
            type="button"
            class="relative z-10 rounded-full px-4 py-1.5 text-xs font-medium transition"
            :class="filter === 'expense' ? 'text-primary' : 'text-muted hover:text-text'"
            @click="filter = 'expense'"
          >
            Gastos ({{ stats.expense }})
          </button>
        </div>
      </div>
    </BaseCard>

    <div class="grid gap-3">
      <BaseCard v-for="row in visibleRows" :key="row.id" class="flex items-center justify-between gap-3">
        <div class="min-w-0 space-y-2">
          <div class="flex items-center gap-2">
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border" :class="getCategoryColorClass(row)">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(path, index) in getCategoryIcon(row).paths" :key="index" :d="path" />
              </svg>
            </span>
            <p class="truncate text-sm font-medium text-text">{{ row.name }}</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="inline-flex rounded-md border px-2 py-1 text-[11px] font-medium" :class="typeChipClass(row.type)">
              {{ typeLabel(row.type) }}
            </span>
            <span class="inline-flex rounded-md border px-2 py-1 text-[11px]" :class="getCategoryColorClass(row)">
              Color
            </span>
          </div>
        </div>
        <ActionButtons @edit="openEdit(row)" @delete="remove(row.id)" />
      </BaseCard>

      <BaseCard v-if="visibleRows.length === 0" class="text-center text-sm text-muted">
        No hay categorías para este filtro.
      </BaseCard>
    </div>

    <BaseModal :open="open" :title="editing ? 'Editar categoría' : 'Nueva categoría'" @close="open = false">
      <form class="space-y-3" @submit.prevent="save">
        <div class="grid grid-cols-2 gap-3">
          <BaseInput v-model="form.name" label="Nombre" required />
          <BaseSelect v-model="form.type" label="Pertenece a" :options="typeOptions" required />
        </div>

        <div>
          <span class="form-label">Icono</span>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="icon in CATEGORY_ICON_OPTIONS"
              :key="icon.value"
              type="button"
              class="flex h-10 items-center justify-center rounded-xl border transition"
              :class="form.icon === icon.value ? 'border-primary bg-primary/15 text-primary' : 'border-surfaceAlt bg-surfaceAlt/40 text-muted hover:text-text'"
              @click="form.icon = icon.value"
              :title="icon.label"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path v-for="(path, index) in icon.paths" :key="index" :d="path" />
              </svg>
            </button>
          </div>
        </div>
        <div>
          <span class="form-label">Color de fondo</span>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="color in CATEGORY_COLOR_OPTIONS"
              :key="color.value"
              type="button"
              class="flex h-10 items-center justify-center rounded-xl border transition"
              :class="[color.className, form.color === color.value ? 'ring-2 ring-primary/60' : 'opacity-90 hover:opacity-100']"
              @click="form.color = color.value"
              :title="color.label"
            >
              <span class="text-[10px] font-semibold uppercase tracking-wide">Aa</span>
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-surfaceAlt bg-surfaceAlt/30 p-3">
          <p class="mb-2 text-[10px] uppercase tracking-[0.08em] text-muted">Vista previa</p>
          <span class="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs" :class="CATEGORY_COLOR_OPTIONS.find((c) => c.value === form.color)?.className">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path v-for="(path, index) in CATEGORY_ICON_OPTIONS.find((i) => i.value === form.icon)?.paths || []" :key="index" :d="path" />
            </svg>
            {{ form.name || 'Nueva categoría' }}
          </span>
        </div>

        <BaseButton type="submit" block>{{ editing ? 'Guardar cambios' : 'Crear categoría' }}</BaseButton>
      </form>
    </BaseModal>
  </section>
</template>
