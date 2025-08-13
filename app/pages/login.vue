<template>
  <AppContainer>
    <AuthCard title="Login">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Password</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="mt-4 text-sm">New? <NuxtLink to="/register" class="underline">Create an account</NuxtLink></p>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'
// Components are auto-registered by Nuxt
const { login } = useAuth()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
  } catch (e: any) {
    if (e?.status === 403 && e?.data?.needsVerification) {
      return navigateTo(`/verify?email=${encodeURIComponent(email.value)}`)
    }
    error.value = 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
