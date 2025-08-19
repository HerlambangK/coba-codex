export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (!cookieHeader.includes('auth_token=')) {
      return navigateTo('/login')
    }
    return
  }

  const { me, fetchMe } = useAuth()
  if (me.value) return
  const current = await fetchMe()
  if (!current) return navigateTo('/login')
})
