export type Me = {
  id: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  name?: string | null
}

export const useAuthUser = () =>
  useState<Me | null>('auth:user', () => null)

