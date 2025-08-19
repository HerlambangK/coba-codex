export default defineNuxtPlugin(() => {
  const { me, fetchMe } = useAuth()
  if (me.value === null) {
    // Sinkronisasi ringan di sisi klien saat navigasi client-only
    fetchMe().catch(() => {})
  }
})
