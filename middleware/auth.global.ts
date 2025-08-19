export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  const user = useAuthUser()
  if (user.value) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (!cookieHeader.includes('auth_token=')) {
      return navigateTo('/login')
    }
    await fetchMe().catch(() => {})
    return
  }

  return navigateTo('/login')
})
