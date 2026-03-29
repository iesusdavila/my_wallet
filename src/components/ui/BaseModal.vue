<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 md:items-center md:p-4">
      <div class="surface-panel w-full max-w-lg rounded-2xl p-4 md:p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-text">{{ title }}</h3>
          <button class="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition hover:border-primary/30 hover:text-text" @click="$emit('close')">Cerrar</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
