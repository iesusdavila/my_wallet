<script setup>
import BaseButton from './BaseButton.vue'

defineProps({
  showPaid: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete', 'paid'])
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row">
    <BaseButton variant="primary" @click="emit('edit')" aria-label="Editar">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </BaseButton>
    <BaseButton variant="danger" @click="emit('delete')" aria-label="Eliminar">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
      </svg>
    </BaseButton>
    <BaseButton v-if="showPaid" variant="success" @click="emit('paid')" aria-label="Marcar pagado">
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </BaseButton>
  </div>
</template>
