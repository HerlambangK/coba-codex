export type Me = {
  id: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  name?: string | null
}

export const useAuthUser = () =>
  useState<Me | null>('auth:user', () => null)

export const setAuthUser = (me: Me | null) => {
  const user = useAuthUser()
  user.value = me
}

export const clearAuthUser = () => {
  setAuthUser(null)
}

export const fetchMe = async (): Promise<Me | null> => {
  const user = useAuthUser()
  try {
    const me = await $fetch<Me>('/api/auth/me', {
      headers: process.server ? useRequestHeaders(['cookie']) : undefined,
    })
    user.value = me
    return me
  } catch {
    user.value = null
    return null
  }
}
