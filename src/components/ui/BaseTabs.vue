<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  tabs: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="inline-flex w-full rounded-xl border border-border bg-surface p-1">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition"
      :class="modelValue === tab.value ? 'bg-primary text-bg' : 'text-muted hover:text-text'"
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
