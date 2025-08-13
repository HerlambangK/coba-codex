import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (!path.startsWith('/api/admin')) return

  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})
