import { defineEventHandler } from 'h3'
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
  const url = process.env.DATABASE_URL || ''
  let dbInfo: any = {}
  try {
    const u = new URL(url)
    dbInfo = {
      host: u.hostname,
      port: u.port || '5432',
      database: u.pathname.replace(/^\//, ''),
      schema: u.searchParams.get('schema') || 'public',
    }
  } catch {
    dbInfo = { parseError: 'Could not parse DATABASE_URL' }
  }

  const checks: any = {}
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.ping = 'ok'
  } catch (e: any) {
    checks.ping = 'fail'
    checks.pingError = e?.message || String(e)
  }

  const counts: any = {}
  const errors: any = {}
  try {
    counts.users = await prisma.user.count()
  } catch (e: any) {
    errors.users = e?.message || String(e)
  }
  try {
    counts.emailVerifications = await prisma.emailVerification.count()
  } catch (e: any) {
    errors.emailVerifications = e?.message || String(e)
  }
  try {
    counts.rateLimits = await prisma.rateLimit.count()
  } catch (e: any) {
    errors.rateLimits = e?.message || String(e)
  }

  if (Object.keys(errors).length) counts.errors = errors

  return {
    ok: checks.ping === 'ok',
    database: dbInfo,
    checks,
    counts,
  }
})

