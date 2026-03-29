<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Selecciona una opción',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex w-full flex-col gap-1.5 text-xs text-muted">
    <span v-if="label">{{ label }}</span>
    <div class="relative">
      <select
        :value="modelValue"
        class="w-full appearance-none rounded-xl border border-border bg-surface px-3 py-2.5 pr-10 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </div>
  </label>
</template>
