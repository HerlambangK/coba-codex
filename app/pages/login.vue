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
const alertOpen = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')
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
    alertTitle.value = e?.status === 404
      ? 'Email tidak terdaftar'
      : e?.status === 401
      ? 'Password salah'
      : 'Gagal masuk'
    alertDesc.value = e?.data?.message || ''
    alertOpen.value = true
  } finally {
    loading.value = false
  }
}
</script>

<!-- Alert dialog for login result (errors) -->
<UiAlertDialog :open="alertOpen" @update:open="val => (alertOpen = val)" :title="alertTitle" :description="alertDesc">
  <template #footer>
    <UiAlertDialogFooter>
      <UiAlertDialogAction text="Tutup" @click="alertOpen = false" />
    </UiAlertDialogFooter>
  </template>
</UiAlertDialog>
