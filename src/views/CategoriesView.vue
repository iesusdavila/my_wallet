<script setup>
import { computed, reactive, ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseToast from '@/components/ui/BaseToast.vue'

const financeStore = useFinanceStore()

const search = ref('')
const filterType = ref('all')
const showAdd = ref(false)
const showEdit = ref(false)
const editingCategory = ref(null)
const toastMessage = ref('')
const form = reactive({
  name: '',
  type: 'expense',
})
const editForm = reactive({
  name: '',
  type: 'expense',
})

const filteredCategories = computed(() => {
  let filtered = financeStore.categories.filter((item) => item.name.toLowerCase().includes(search.value.toLowerCase()))
  if (filterType.value !== 'all') {
    filtered = filtered.filter((item) => item.type === filterType.value)
  }
  return filtered
})

const notify = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

const saveCategory = () => {
  if (!form.name.trim()) {
    return
  }

  financeStore.addCategory({
    name: form.name,
    type: form.type,
  })

  form.name = ''
  form.type = 'expense'
  showAdd.value = false
  notify('Categoría creada')
}

const removeCategory = async (id) => {
  try {
    await financeStore.deleteCategory(id)
    notify('Categoría eliminada')
  } catch (error) {
    notify(error.message || 'No se pudo eliminar la categoría')
  }
}

const openEdit = (category) => {
  editingCategory.value = category
  editForm.name = category.name
  editForm.type = category.type
  showEdit.value = true
}

const saveEdit = async () => {
  if (!editForm.name.trim()) {
    return
  }

  try {
    await financeStore.updateCategory(editingCategory.value.id, {
      name: editForm.name,
      type: editForm.type,
    })
    showEdit.value = false
    editingCategory.value = null
    notify('Categoría actualizada')
  } catch (error) {
    notify(error.message || 'No se pudo actualizar la categoría')
  }
}
</script>

<template>
  <section class="app-page">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="section-title">Categorías</h2>
        <p class="muted text-xs">Administra y elimina categorías en una sección dedicada</p>
      </div>
      <BaseButton size="sm" @click="showAdd = true">+ Nueva categoría</BaseButton>
    </div>

    <BaseCard>
      <div class="grid gap-3 md:grid-cols-2">
        <BaseInput v-model="search" label="Buscar categoría" placeholder="Ej. Alimentación" />
        <BaseSelect
          v-model="filterType"
          label="Filtrar por tipo"
          :options="[
            { value: 'all', label: 'Todos' },
            { value: 'expense', label: 'Gastos' },
            { value: 'income', label: 'Ingresos' },
          ]"
        />
      </div>
    </BaseCard>

    <div v-if="filteredCategories.length" class="space-y-2">
      <BaseCard v-for="category in filteredCategories" :key="category.id">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-text">{{ category.name }}</p>
            <p
              class="mt-1 inline-flex rounded-full px-2 py-0.5 text-xs"
              :class="category.type === 'expense' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'"
            >
              {{ category.type === 'expense' ? 'Gasto' : 'Ingreso' }}
            </p>
          </div>
          <div class="flex gap-1">
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition hover:border-primary hover:bg-primary/20"
              @click="openEdit(category)"
              :title="'Editar categoría'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M11.049 3.049a1.5 1.5 0 0 1 2.122 0l3.78 3.78a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1.5 1.5 0 0 1-.708.293l-4 1a1.5 1.5 0 0 1-1.793-1.793l1-4a1.5 1.5 0 0 1 .293-.708l8.5-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger transition hover:border-danger hover:bg-danger/20"
              @click="removeCategory(category.id)"
              :title="'Eliminar categoría'"
            >
              <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 1.06 1.06L10 8.94 6.28 5.22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-else>
      <p class="text-sm text-text">No hay categorías para mostrar.</p>
    </BaseCard>

    <BaseModal :open="showAdd" title="Agregar categoría" @close="showAdd = false">
      <div class="space-y-3">
        <BaseInput v-model="form.name" label="Nombre" placeholder="Ej. Salud" />
        <BaseSelect
          v-model="form.type"
          label="Tipo"
          :options="[
            { value: 'expense', label: 'Gasto' },
            { value: 'income', label: 'Ingreso' },
          ]"
        />
        <BaseButton block @click="saveCategory">Guardar categoría</BaseButton>
      </div>
    </BaseModal>

    <BaseModal :open="showEdit" title="Editar categoría" @close="showEdit = false">
      <div class="space-y-3">
        <BaseInput v-model="editForm.name" label="Nombre" placeholder="Ej. Salud" />
        <BaseSelect
          v-model="editForm.type"
          label="Tipo"
          :options="[
            { value: 'expense', label: 'Gasto' },
            { value: 'income', label: 'Ingreso' },
          ]"
        />
        <BaseButton block @click="saveEdit">Actualizar categoría</BaseButton>
      </div>
    </BaseModal>

    <BaseToast :visible="Boolean(toastMessage)" :message="toastMessage" />
  </section>
</template>
