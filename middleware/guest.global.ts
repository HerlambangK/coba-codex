const guestPaths = ['/login', '/register', '/verify']
const normalizePath = (p: string) => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p)

export default defineNuxtRouteMiddleware(async (to) => {
  const path = normalizePath(to.path)
  if (!guestPaths.includes(path)) return

  const user = useAuthUser()
  if (user.value) {
    return navigateTo('/dashboard')
  }

  if (process.server) {
    const me = await fetchMe()
    if (me) return navigateTo('/dashboard')
  }
})
