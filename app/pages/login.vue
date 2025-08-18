<template>
  <AppContainer>
    <AuthCard title="Masuk">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model="email" type="email" required />
        </div>
        <div class="space-y-2">
          <UiLabel for="password">Password</UiLabel>
          <UiInput id="password" v-model="password" type="password" required />
        </div>
        <UiButton type="submit" :disabled="loading" class="w-full">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </UiButton>
      </form>
      <div class="mt-2 text-sm"><NuxtLink to="/forgot" class="underline">Lupa kata sandi?</NuxtLink></div>
      <div class="mt-4 text-sm">Baru di sini? <NuxtLink to="/register" class="underline">Buat akun</NuxtLink></div>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'
const { toast } = useToast()
// Components are auto-registered by Nuxt
const { login } = useAuth()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await login(email.value, password.value)
  } catch (e: any) {
    if (e?.status === 403 && e?.data?.needsVerification) {
      return navigateTo(`/verify?email=${encodeURIComponent(email.value)}`)
    }
    if (e?.status === 404) {
      toast({ title: 'Email tidak terdaftar', variant: 'destructive' })
    } else if (e?.status === 401) {
      toast({ title: 'Password salah', variant: 'destructive' })
    } else {
      toast({ title: 'Gagal masuk', description: e?.data?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  } finally {
    loading.value = false
  }
}
</script>
