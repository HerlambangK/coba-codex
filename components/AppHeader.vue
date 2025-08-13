<template>
  <header class="border-b bg-background/70 backdrop-blur">
    <div class="container h-14 flex items-center justify-between">
      <NuxtLink to="/" class="font-semibold">{{ title }}</NuxtLink>
      <nav class="flex items-center gap-4 text-sm">
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <template v-if="me">
          <span class="opacity-70">{{ me.email }} ({{ me.role }})</span>
          <button class="underline" @click="logout">Logout</button>
        </template>
        <template v-else>
          <NuxtLink to="/login">Login</NuxtLink>
          <NuxtLink to="/register">Register</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
const { me, logout } = useAuth()
const title = useRuntimeConfig().public?.appName || 'Nuxt App'
</script>

