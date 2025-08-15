<template>
  <AppContainer>
    <AuthCard title="Masuk">
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
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="mt-2 text-sm"><NuxtLink to="/forgot" class="underline">Lupa kata sandi?</NuxtLink></p>
      <p class="mt-4 text-sm">Baru di sini? <NuxtLink to="/register" class="underline">Buat akun</NuxtLink></p>
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
    error.value = e?.data?.message || 'Email atau kata sandi salah'
  } finally {
    loading.value = false
  }
}
</script>
