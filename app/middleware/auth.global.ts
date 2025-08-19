export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (!cookieHeader.includes('auth_token=')) {
      return navigateTo('/login')
    }
    return
  }

  const user = useAuthUser()
  if (user.value) return

  const me = await fetchMe()
  if (!me) {
    return navigateTo('/login')
  }
})
