<template>
  <AppContainer>
    <AuthCard title="Lupa kata sandi">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          {{ loading ? 'Mengirim...' : 'Kirim tautan reset' }}
        </button>
        <p v-if="info" class="text-sm text-green-700">{{ info }}</p>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="mt-4 text-sm"><NuxtLink to="/login" class="underline">Kembali ke login</NuxtLink></p>
    </AuthCard>
  </AppContainer>
  
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const info = ref('')
const error = ref('')

async function onSubmit() {
  loading.value = true
  info.value = ''
  error.value = ''
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: { email: email.value } })
    info.value = 'Jika email terdaftar, kami telah mengirim instruksi.'
  } catch (e: any) {
    error.value = e?.data?.message || 'Gagal mengirim email reset'
  } finally {
    loading.value = false
  }
}
</script>
