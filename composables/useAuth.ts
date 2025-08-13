import { ref } from 'vue'

type Me = { id: string; email: string; name: string | null; role: 'ADMIN' | 'CUSTOMER'; isVerified: boolean }

const meState = ref<Me | null>(null)

export function useAuth() {
  const me = useState<Me | null>('me', () => meState.value)

  async function fetchMe() {
    try {
      const data = await $fetch<Me>('/api/auth/me')
      me.value = data
      meState.value = data
      return data
    } catch (e: any) {
      me.value = null
      if (e?.status === 401) return null
      throw e
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await $fetch<{ role?: string; needsVerification?: boolean }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      if ((res as any).needsVerification) {
        return navigateTo(`/verify?email=${encodeURIComponent(email)}`)
      }
      await fetchMe()
      return navigateTo('/dashboard')
    } catch (e: any) {
      throw e
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    me.value = null
    meState.value = null
    return navigateTo('/login')
  }

  return { me, fetchMe, login, logout }
}

