export default defineNuxtPlugin(async () => {
  const { me, fetchMe } = useAuth()
  if (me.value === null) {
    await fetchMe().catch(() => {})
  }
})
