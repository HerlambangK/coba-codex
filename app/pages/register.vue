<template>
  <AppContainer>
    <AuthCard title="Buat akun">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Kata sandi</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
          <p class="text-xs opacity-70">Minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol.</p>
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Name (optional)</label>
          <input v-model="name" type="text" class="w-full border rounded px-3 py-2" />
        </div>
        <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          {{ loading ? 'Membuat...' : 'Buat akun' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="mt-4 text-sm">Sudah punya akun? <NuxtLink to="/login" class="underline">Masuk</NuxtLink></p>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
// Components are auto-registered

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: { email: email.value, password: password.value, name: name.value || undefined } })
    navigateTo(`/verify?email=${encodeURIComponent(email.value)}`)
  } catch (e: any) {
    error.value = e?.data?.message || 'Gagal mendaftar'
  } finally {
    loading.value = false
  }
}
</script>
