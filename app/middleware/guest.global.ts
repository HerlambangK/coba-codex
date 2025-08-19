const guestPaths = ['/login', '/register', '/verify']
const normalizePath = (p: string) => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p)

export default defineNuxtRouteMiddleware((to) => {
  const path = normalizePath(to.path)
  if (!guestPaths.includes(path)) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (cookieHeader.includes('auth_token=')) {
      return navigateTo('/dashboard')
    }
    return
  }

  const token = useCookie('auth_token')
  if (token.value) {
    return navigateTo('/dashboard')
  }
})
