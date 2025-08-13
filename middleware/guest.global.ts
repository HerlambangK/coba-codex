const guestOnly = new Set(['/login', '/register', '/verify'])

export default defineNuxtRouteMiddleware(async (to) => {
  if (!guestOnly.has(to.path)) return
  try {
    await $fetch('/api/auth/me')
    return navigateTo('/dashboard')
  } catch {
    // not logged in -> continue
  }
})

