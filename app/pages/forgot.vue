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
      <div class="mt-4 text-sm"><NuxtLink to="/login" class="underline">Kembali ke login</NuxtLink></div>
    </AuthCard>
  </AppContainer>
  
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const { toast } = useToast()

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    toast({ title: 'Cek email Anda', description: 'Jika email terdaftar, kami telah mengirim instruksi.', variant: 'info' })
  } catch (e: any) {
    if (e?.status === 404) {
      toast({ title: 'Email tidak terdaftar', variant: 'destructive' })
    } else if (e?.status === 403) {
      toast({ title: 'Email belum terverifikasi', description: 'Silakan verifikasi email terlebih dahulu.', variant: 'warning' })
    } else {
      toast({ title: 'Gagal mengirim email reset', description: e?.data?.message || 'Terjadi kesalahan', variant: 'destructive' })
    }
  } finally {
    loading.value = false
  }
}
</script>
