<template>
  <AppContainer>
    <AuthCard title="Create account">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label class="block text-sm">Email</label>
          <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Password</label>
          <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
          <p class="text-xs opacity-70">8+ chars with upper, lower, number, and symbol.</p>
        </div>
        <div class="space-y-2">
          <label class="block text-sm">Name (optional)</label>
          <input v-model="name" type="text" class="w-full border rounded px-3 py-2" />
        </div>
        <button :disabled="loading" class="px-4 py-2 bg-primary text-primary-foreground rounded">
          {{ loading ? 'Creating...' : 'Create account' }}
        </button>
      </form>
      <p class="mt-4 text-sm">Already have an account? <NuxtLink to="/login" class="underline">Login</NuxtLink></p>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
// Components are auto-registered

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: { email: email.value, password: password.value, name: name.value || undefined } })
    navigateTo(`/verify?email=${encodeURIComponent(email.value)}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
