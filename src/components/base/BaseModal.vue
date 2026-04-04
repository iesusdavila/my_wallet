<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-[2px] sm:items-center" @click.self="emit('close')">
      <div class="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-surfaceAlt/90 bg-surface p-4 shadow-card">
        <div class="mb-3 flex items-center justify-between subtle-divider pb-2">
          <h3 class="text-base font-semibold">{{ title }}</h3>
          <button class="rounded-xl border border-surfaceAlt bg-surfaceAlt/40 p-1 text-muted transition hover:text-text" @click="emit('close')">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
