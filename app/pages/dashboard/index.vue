<template>
  <AppContainer>
    <div class="prose dark:prose-invert">
      <h1>Dashboard</h1>
      <ul>
        <!-- Tampilkan hanya jika user ADMIN -->
        <li v-if="me?.role === 'ADMIN'">
          <NuxtLink class="underline" to="/dashboard/admin">Admin</NuxtLink>
        </li>

        <!-- Tampilkan hanya jika user CUSTOMER -->
        <li v-else-if="me?.role === 'CUSTOMER'">
          <NuxtLink class="underline" to="/dashboard/customer">Customer</NuxtLink>
        </li>
      </ul>
    </div>
  </AppContainer>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { me } = useAuth()
</script>
