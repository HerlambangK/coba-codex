<template>
  <AppContainer>
    <AuthCard title="Reset password">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">6-digit code</label>
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            pattern="[0-9]{6}"
            maxlength="6"
            class="w-full border rounded px-3 py-2 tracking-widest"
            required
            @input="code = code.replace(/\\D/g, '').slice(0, 6)"
            title="Masukkan 6 digit angka"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">New password</label>
          <input v-model="newPassword" type="password" class="w-full border rounded px-3 py-2" required />
          <p class="text-xs opacity-70">8+ chars with upper, lower, number, and symbol.</p>
        </div>
        <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          {{ loading ? 'Resetting...' : 'Reset password' }}
        </button>
        <p v-if="info" class="text-sm text-green-700">{{ info }}</p>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="mt-4 text-sm"><NuxtLink to="/login" class="underline">Back to login</NuxtLink></p>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const email = ref<string>((route.query.email as string) || '')
const code = ref<string>((route.query.code as string) || '')
const newPassword = ref('')
const loading = ref(false)
const info = ref('')
const error = ref('')

async function onSubmit() {
  loading.value = true
  info.value = ''
  error.value = ''
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { email: email.value, code: code.value, newPassword: newPassword.value },
    })
    info.value = 'Password updated. You can now log in.'
    setTimeout(() => navigateTo('/login'), 800)
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to reset password'
  } finally {
    loading.value = false
  }
}
</script>

