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
const alertShown = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')
const alertVariant = ref<'default' | 'destructive' | 'info' | 'success' | 'warning'>('default')
const alertIcon = ref<string | undefined>(undefined)
// Components are auto-registered by Nuxt
const { login } = useAuth()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await login(email.value, password.value)
    toast({ title: 'Berhasil masuk', variant: 'success' })
  } catch (e: any) {
    if (e?.status === 403 && e?.data?.needsVerification) {
      return navigateTo(`/verify?email=${encodeURIComponent(email.value)}`)
    }
    if (e?.status === 404) {
      alertTitle.value = 'Email tidak terdaftar'
      alertVariant.value = 'destructive'
      alertIcon.value = 'lucide:mail-x'
    } else if (e?.status === 401) {
      alertTitle.value = 'Password salah'
      alertVariant.value = 'destructive'
      alertIcon.value = 'lucide:lock-keyhole'
    } else {
      alertTitle.value = 'Gagal masuk'
      alertVariant.value = 'destructive'
      alertIcon.value = 'lucide:triangle-alert'
    }
    alertDesc.value = e?.data?.message || ''
    alertShown.value = true
  } finally {
    loading.value = false
  }
}
</script>

<!-- Inline Alert for login result (errors) -->
<div class="mt-4">
  <UiAlert v-model="alertShown" :title="alertTitle" :description="alertDesc" :variant="alertVariant" :icon="alertIcon" />
  </div>
