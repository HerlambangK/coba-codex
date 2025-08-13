import prisma from './prisma'

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; remaining: number; retryAfterSec?: number }> {
  const now = new Date()
  const windowMs = windowSec * 1000
  const windowStartMs = Math.floor(now.getTime() / windowMs) * windowMs
  const windowStart = new Date(windowStartMs)

  const rec = await prisma.rateLimit.upsert({
    where: { key_window: { key, window: windowStart } },
    create: { key, window: windowStart, count: 1 },
    update: { count: { increment: 1 } },
  })

  const count = rec.count
  const allowed = count <= limit
  const remaining = allowed ? limit - count : 0
  const retryAfterSec = allowed
    ? undefined
    : Math.max(1, Math.ceil((windowStartMs + windowMs - now.getTime()) / 1000))

  return { allowed, remaining, retryAfterSec }
}

