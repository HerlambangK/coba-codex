<template>
  <AppContainer>
    <AuthCard title="Lupa kata sandi">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model="email" type="email" required />
        </div>
        <UiButton type="submit" :disabled="loading" class="w-full">
          {{ loading ? 'Mengirim...' : 'Kirim tautan reset' }}
        </UiButton>
      </form>
      <div class="mt-4">
        <UiAlert v-model="alertOpen" :title="alertTitle" :description="alertDesc" />
      </div>
      <div class="mt-4 text-sm"><NuxtLink to="/login" class="underline">Kembali ke login</NuxtLink></div>
    </AuthCard>
  </AppContainer>
  
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const alertOpen = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    alertTitle.value = 'Cek email Anda'
    alertDesc.value = 'Jika email terdaftar, kami telah mengirim instruksi.'
    alertOpen.value = true
  } catch (e: any) {
    alertTitle.value = e?.status === 404
      ? 'Email tidak terdaftar'
      : e?.status === 403
      ? 'Email belum terverifikasi'
      : 'Gagal mengirim email reset'
    alertDesc.value = e?.data?.message || (e?.status === 403 ? 'Silakan verifikasi email terlebih dahulu.' : '')
    alertOpen.value = true
  } finally {
    loading.value = false
  }
}
</script>

