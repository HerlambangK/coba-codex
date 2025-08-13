import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { getUserFromEvent } from '~/server/utils/auth'
import prisma from '~/server/utils/prisma'

const BodySchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['ADMIN', 'CUSTOMER']),
})

export default defineEventHandler(async (event) => {
  const current = await getUserFromEvent(event)
  if (!current) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (current.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody(event)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const { userId, role } = parsed.data
  await prisma.user.update({ where: { id: userId }, data: { role } })
  return { ok: true }
})

