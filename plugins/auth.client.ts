export default defineNuxtPlugin(() => {
  const user = useAuthUser()
  if (user.value === null) {
    // Sinkronisasi ringan di sisi klien saat navigasi client-only
    fetchMe().catch(() => {})
  }
})

