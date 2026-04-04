<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const classes = {
  primary: 'bg-primary/18 text-primary border border-primary/45 hover:bg-primary/28 shadow-soft',
  success: 'bg-success/18 text-success border border-success/40 hover:bg-success/28 shadow-soft',
  danger: 'bg-danger/16 text-danger border border-danger/40 hover:bg-danger/24 shadow-soft',
  ghost: 'bg-surface/80 text-text border border-surfaceAlt hover:bg-surfaceAlt/80',
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60"
    :class="[classes[variant], block ? 'w-full' : '']"
  >
    <slot />
  </button>
</template>
