export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/dashboard')) return
  const user = useAuthUser()
  if (!user.value) {
    return navigateTo('/login')
  }
})

