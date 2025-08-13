export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/dashboard')) return
  try {
    await $fetch('/api/auth/me')
  } catch (e: any) {
    if (e?.status === 401) {
      return navigateTo('/login')
    }
  }
})

