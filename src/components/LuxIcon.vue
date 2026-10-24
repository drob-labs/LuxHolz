<script setup lang="ts">
withDefaults(defineProps<{
  name: 'external' | 'down' | 'up' | 'check' | 'plus' | 'minus' | 'close' | 'swiss' | 'parquet'
  class?: string
}>(), { class: '' })
</script>

<template>
  <svg
    :class="['lux-icon', `lux-icon--${name}`, $props.class]"
    :viewBox="name === 'parquet' ? '0 0 48 48' : '0 0 24 24'"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'external'"><path d="M7 17 17 7M8 7h9v9" /></template>
    <template v-else-if="name === 'down'"><path d="M12 4v15m-6-6 6 6 6-6" /></template>
    <template v-else-if="name === 'up'"><path d="M12 20V5m-6 6 6-6 6 6" /></template>
    <template v-else-if="name === 'check'"><path d="m5 12 4.5 4.5L19 7" /></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'minus'"><path d="M5 12h14" /></template>
    <template v-else-if="name === 'close'"><path d="m6 6 12 12M18 6 6 18" /></template>
    <template v-else-if="name === 'swiss'"><path d="M12 3v18M3 12h18" stroke-width="3.5" /></template>
    <template v-else-if="name === 'parquet'">
      <path d="m5 15 19-10 19 10-19 10L5 15Z" />
      <path d="M5 15v18l19 10M43 15v18L24 43M24 25v18M14.5 20 33.5 10" />
    </template>
  </svg>
</template>

<style scoped>
.lux-icon { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.35; stroke-linecap: round; stroke-linejoin: round; }
.lux-icon--parquet { width: 48px; height: 48px; stroke-width: 1; }
</style>
