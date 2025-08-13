import { defineEventHandler, createError } from 'h3'
import { getUserFromEvent } from '~~/server/utils/auth'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, isVerified: true, name: true },
    orderBy: { createdAt: 'desc' },
  })
  return { users }
})
