export default defineNuxtPlugin(async () => {
  const user = useAuthUser()
  try {
    const me = await $fetch('/api/auth/me', {
      headers: useRequestHeaders(['cookie']),
    })
    user.value = me as any
  } catch {
    user.value = null
  }
})

