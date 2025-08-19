export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/dashboard')) return

  if (process.server) {
    const cookieHeader = useRequestHeaders(['cookie']).cookie || ''
    if (!cookieHeader.includes('auth_token=')) {
      return navigateTo('/login')
    }
    return
  }

  const token = useCookie('auth_token')
  if (!token.value) {
    return navigateTo('/login')
  }
})
