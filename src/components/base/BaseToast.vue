<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)

const color = {
  info: 'border-primary/40 text-primary bg-primary/10',
  success: 'border-success/40 text-success bg-success/10',
  error: 'border-danger/40 text-danger bg-danger/10',
}
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2 px-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-card backdrop-blur-sm"
      :class="color[toast.type] || color.info"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
