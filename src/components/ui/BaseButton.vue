<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  block: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl border transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40'
  const variants = {
    primary:
      'border-primary bg-primary text-bg shadow-[0_0_0_1px_rgba(138,180,248,0.18),0_8px_24px_rgba(102,157,246,0.24)] hover:bg-primary-strong hover:border-primary-strong',
    secondary: 'border-border bg-surface text-text hover:bg-surface-2 hover:border-primary/40',
    danger: 'border-danger bg-danger text-bg hover:opacity-90',
    ghost: 'border-transparent bg-transparent text-text hover:bg-surface',
  }
  const sizes = {
    sm: 'px-3 py-2 text-xs font-medium',
    md: 'px-4 py-2.5 text-sm font-medium',
    lg: 'px-5 py-3 text-sm font-semibold',
  }

  return [base, variants[props.variant], sizes[props.size], props.block ? 'w-full' : ''].join(' ')
})
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
