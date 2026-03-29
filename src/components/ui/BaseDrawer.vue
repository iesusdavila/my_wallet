<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-[2px]" @click.self="$emit('close')">
      <aside class="surface-panel h-full w-[88%] max-w-90 rounded-r-2xl p-4 md:p-5">
        <slot />
      </aside>
    </div>
  </Teleport>
</template>
