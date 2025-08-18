<template>
  <AppContainer>
    <AuthCard title="Verifikasi email Anda">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model="email" type="email" required />
        </div>
        <div class="space-y-2">
          <UiLabel for="code">Kode 6 digit</UiLabel>
          <UiPinInput v-model="code" :input-count="6" />
        </div>
        <div class="flex items-center gap-3">
          <UiButton :disabled="loading" type="submit">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
          </UiButton>
          <UiButton :disabled="resending" type="button" variant="ghost" class="underline p-0" @click="onResend">
            {{ resending ? 'Mengirim ulang...' : 'Kirim ulang kode' }}
          </UiButton>
        </div>
      </form>
      <div class="mt-4">
        <UiAlert v-model="alertShown" :title="alertTitle" :description="alertDesc" :variant="alertVariant" :icon="alertIcon" />
      </div>
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
const alertShown = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')
const alertVariant = ref<'default' | 'destructive' | 'info' | 'success' | 'warning'>('default')
const alertIcon = ref<string | undefined>(undefined)

// Tampilkan info singkat saat datang dari register
onMounted(() => {
  if (route.query.flash === 'registered') {
    alertTitle.value = 'Verifikasi email'
    alertDesc.value = email.value
      ? `Masukkan kode 6 digit yang dikirim ke ${email.value}.`
      : 'Masukkan kode 6 digit yang dikirim ke email Anda.'
    alertVariant.value = 'info'
    alertIcon.value = 'lucide:mail'
    alertShown.value = true
  }
})

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/verify', { method: 'POST', body: { email: email.value, code: code.value } })
    alertTitle.value = 'Berhasil diverifikasi'
    alertDesc.value = 'Anda bisa masuk sekarang.'
    alertVariant.value = 'success'
    alertIcon.value = 'lucide:badge-check'
    alertShown.value = true
    setTimeout(() => navigateTo('/login'), 800)
  } catch (e: any) {
    alertTitle.value = 'Gagal verifikasi'
    alertDesc.value = e?.data?.message || 'Kode tidak valid atau kedaluwarsa'
    alertVariant.value = 'destructive'
    alertIcon.value = 'lucide:triangle-alert'
    alertShown.value = true
  } finally {
    loading.value = false
  }
}

async function onResend() {
  resending.value = true
  try {
    await $fetch('/api/auth/resend-code', { method: 'POST', body: { email: email.value } })
    alertTitle.value = 'Kode dikirim'
    alertDesc.value = 'Periksa email Anda.'
    alertVariant.value = 'info'
    alertIcon.value = 'lucide:mail'
    alertShown.value = true
  } catch (e: any) {
    alertTitle.value = 'Terlalu sering'
    alertDesc.value = e?.data?.message || 'Harap tunggu sebelum meminta lagi'
    alertVariant.value = 'warning'
    alertIcon.value = 'lucide:clock'
    alertShown.value = true
  } finally {
    resending.value = false
  }
}
</script>
