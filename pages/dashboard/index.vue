<template>
  <AppContainer>
    <div class="prose dark:prose-invert">
      <h1>Dashboard</h1>
      <ul>
        <li><NuxtLink class="underline" to="/dashboard/admin">Admin</NuxtLink></li>
        <li><NuxtLink class="underline" to="/dashboard/customer">Customer</NuxtLink></li>
      </ul>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import AppContainer from '~/components/AppContainer.vue'
</script>

