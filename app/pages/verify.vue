<template>
  <AppContainer>
    <AuthCard title="Verify your email">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">6-digit code</label>
          <input v-model="code" type="text" inputmode="numeric" pattern="\\d{6}" maxlength="6" class="w-full border rounded px-3 py-2 tracking-widest" required />
        </div>
        <div class="flex items-center gap-3">
          <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>
          <button :disabled="resending" type="button" class="text-sm underline" @click="onResend">{{ resending ? 'Resending...' : 'Resend code' }}</button>
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
    info.value = 'Verified! You can now log in.'
    setTimeout(() => navigateTo('/login'), 800)
  } catch (e: any) {
    error.value = e?.data?.message || 'Invalid or expired code'
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
    info.value = 'Code sent. Check your inbox.'
  } catch (e: any) {
    if (e?.status === 429) info.value = e?.data?.message || 'Please wait before requesting again'
  } finally {
    resending.value = false
  }
}
</script>
