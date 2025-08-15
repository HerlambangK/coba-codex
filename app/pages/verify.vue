<template>
  <AppContainer>
    <AuthCard title="Verifikasi email Anda">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Kode 6 digit</label>

          <input v-model="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}"
            maxlength="6" class="w-full border rounded px-3 py-2 tracking-widest" required
            @input="code = code.replace(/\\D/g, '').slice(0, 6)" title="Masukkan 6 digit angka" />
        </div>
        <div class="flex items-center gap-3">
          <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
          </button>
          <button :disabled="resending" type="button" class="text-sm underline" @click="onResend">{{ resending ?
            'Mengirim ulang...' : 'Kirim ulang kode' }}</button>
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="info" class="text-sm text-green-700">{{ info }}</p>
      </form>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
// Components are auto-registered

const route = useRoute()
const email = ref<string>((route.query.email as string) || '')
const code = ref<string>((route.query.code as string) || '')
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const info = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  info.value = ''
  try {
    await $fetch('/api/auth/verify', { method: 'POST', body: { email: email.value, code: code.value } })
    info.value = 'Berhasil diverifikasi. Anda bisa masuk sekarang.'
    setTimeout(() => navigateTo('/login'), 800)
  } catch (e: any) {
    error.value = e?.data?.message || 'Kode tidak valid atau kedaluwarsa'
  } finally {
    loading.value = false
  }
}

async function onResend() {
  resending.value = true
  error.value = ''
  info.value = ''
  try {
    await $fetch('/api/auth/resend-code', { method: 'POST', body: { email: email.value } })
    info.value = 'Kode dikirim. Periksa email Anda.'
  } catch (e: any) {
    if (e?.status === 429) info.value = e?.data?.message || 'Harap tunggu sebelum meminta lagi'
  } finally {
    resending.value = false
  }
}
</script>
