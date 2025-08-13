<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader />
    <main class="container py-8">
      <slot />
    </main>
  </div>
  
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
</script>

