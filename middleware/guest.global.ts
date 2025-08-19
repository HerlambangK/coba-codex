const guestPaths = ['/login', '/register', '/verify']
const normalizePath = (p: string) => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p)

export default defineNuxtRouteMiddleware(async (to) => {
  const path = normalizePath(to.path)
  if (!guestPaths.includes(path)) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (cookieHeader.includes('auth_token=')) {
      return navigateTo('/dashboard')
    }
    return
  }

  const user = useAuthUser()
  if (user.value) {
    return navigateTo('/dashboard')
  }

  const me = await fetchMe()
  if (me) {
    return navigateTo('/dashboard')
  }
})
