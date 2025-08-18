<template>
  <AppContainer>
    <AuthCard title="Verifikasi email Anda">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model.trim="email" type="email" required autocomplete="email" />
        </div>

        <div class="space-y-2">
          <UiLabel for="code">Kode 6 digit</UiLabel>
          <!-- Aktif hanya jika email valid -->
          <UiPinInput id="code" v-model="code" :input-count="6" :disabled="!isEmailValid" />
          <p v-if="!isEmailValid && email" class="text-sm text-red-600">
            Email tidak valid.
          </p>
          <p v-else-if="!email" class="text-sm text-gray-500">
            Isi email terlebih dahulu untuk mengaktifkan PIN.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Aktif hanya bila PIN lengkap -->
          <UiButton :disabled="!canSubmit || loading" type="submit">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
          </UiButton>

          <UiButton :disabled="!isEmailValid || resending" type="button" variant="ghost" class="underline p-0"
            @click="onResend">
            {{ resending ? 'Mengirim ulang...' : 'Kirim ulang kode' }}
          </UiButton>
        </div>
      </form>

      <div class="mt-4">
        <UiAlert v-model="alertShown" :title="alertTitle" :description="alertDesc" :variant="alertVariant"
          :icon="alertIcon" />
      </div>
    </AuthCard>
  </AppContainer>
</template>

<script setup lang="ts">
const route = useRoute()
const email = ref<string>((route.query.email as string) || '')

// v-model untuk UiPinInput wajib array
const code = ref<string[]>(Array(6).fill(''))

const loading = ref(false)
const resending = ref(false)
const alertShown = ref(false)
const alertTitle = ref('')
const alertDesc = ref('')
const alertVariant = ref<'default' | 'destructive' | 'info' | 'success' | 'warning'>('default')
const alertIcon = ref<string | undefined>(undefined)

const codeString = computed(() => code.value.join('').slice(0, 6))

// Validasi email sederhana
const isEmailValid = computed(() => {
  if (!email.value) return false
  // regex email basic
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

// PIN lengkap bila 6 kotak terisi (masing2 satu char)
const isPinComplete = computed(() => code.value.every(v => typeof v === 'string' && v.length === 1))

// Tombol Verifikasi aktif hanya jika email valid & PIN lengkap
const canSubmit = computed(() => isEmailValid.value && isPinComplete.value && !loading.value)

// Jika email diubah menjadi kosong/tidak valid, kosongkan PIN
watch(isEmailValid, valid => {
  if (!valid) code.value = Array(6).fill('')
})

// --- contoh onSubmit/onResend tetap sama punyamu ---
async function onSubmit() {
  if (!canSubmit.value) return
  loading.value = true
  try {
    await $fetch('/api/auth/verify', {
      method: 'POST',
      body: { email: email.value, code: codeString.value },
    })
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
  if (!isEmailValid.value) return
  resending.value = true
  try {
    await $fetch('/api/auth/resend-code', {
      method: 'POST',
      body: { email: email.value },
    })
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
