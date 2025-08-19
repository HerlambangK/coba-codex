export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  const user = useAuthUser()
  if (user.value) return

  if (process.server) {
    const me = await fetchMe()
    if (me) return
  }

  return navigateTo('/login')
})
