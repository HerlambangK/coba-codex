<template>
  <div class="max-w-md mx-auto bg-card text-card-foreground border rounded-lg shadow-sm p-6">
    <h1 class="text-xl font-semibold mb-4">{{ title }}</h1>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>
