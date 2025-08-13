<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppHeader />
    <main class="container py-8">
      <slot />
    </main>
  </div>
  
</template>

<script setup lang="ts">
// Components are auto-registered by Nuxt
</script>
