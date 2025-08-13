<template>
  <AppContainer>
    <div class="prose dark:prose-invert">
      <h1>Welcome</h1>
      <p>This is the starter with auth, RBAC, and email verification.</p>
      <p>
        <NuxtLink class="underline" to="/register">Create an account</NuxtLink> or
        <NuxtLink class="underline" to="/login">log in</NuxtLink> to continue.
      </p>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import AppContainer from '~/components/AppContainer.vue'
</script>

