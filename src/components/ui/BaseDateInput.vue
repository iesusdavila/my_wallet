<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex w-full flex-col gap-1.5 text-xs text-muted">
    <span v-if="label">{{ label }}</span>
    <input
      type="date"
      :value="modelValue"
      class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>
