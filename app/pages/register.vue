<template>
  <AppContainer>
    <AuthCard title="Buat akun">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model="email" type="email" required />
        </div>
        <div class="space-y-2">
          <UiLabel for="password">Kata sandi</UiLabel>
          <UiInput id="password" v-model="password" type="password" required />
          <p class="text-xs opacity-70">Minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol.</p>
        </div>
        <div class="space-y-2">
          <UiLabel for="name">Nama (opsional)</UiLabel>
          <UiInput id="name" v-model="name" type="text" />
        </div>
        <UiButton type="submit" :disabled="loading" class="w-full">
          {{ loading ? 'Membuat...' : 'Buat akun' }}
        </UiButton>
      </form>
      <div class="mt-4 text-sm">Sudah punya akun? <NuxtLink to="/login" class="underline">Masuk</NuxtLink></div>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
// Components are auto-registered

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const alertShown = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')
const alertVariant = ref<'default' | 'destructive' | 'info' | 'success' | 'warning'>('default')
const alertIcon = ref<string | undefined>(undefined)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: { email: email.value, password: password.value, name: name.value || undefined } })
    alertTitle.value = 'Pendaftaran berhasil'
    alertDesc.value = 'Silakan verifikasi email Anda untuk melanjutkan.'
    alertVariant.value = 'info'
    alertIcon.value = 'lucide:mail-check'
    alertShown.value = true
    setTimeout(() => navigateTo(`/verify?email=${encodeURIComponent(email.value)}`), 600)
  } catch (e: any) {
    alertTitle.value = 'Gagal mendaftar'
    alertDesc.value = e?.data?.message || ''
    alertVariant.value = 'destructive'
    alertIcon.value = 'lucide:triangle-alert'
    alertShown.value = true
  } finally {
    loading.value = false
  }
}
</script>
