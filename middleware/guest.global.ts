const guestRoutes = new Set<string>(['/login', '/register', '/verify'])

export default defineNuxtRouteMiddleware((to) => {
  if (!guestRoutes.has(to.path)) return
  const user = useAuthUser()
  if (user.value) {
    return navigateTo('/dashboard')
  }
})

