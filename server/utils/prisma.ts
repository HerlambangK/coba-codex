import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const createClient = () =>
  new PrismaClient({
    log: [
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  })

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = createClient()
} else {
  if (!global.__prisma) {
    global.__prisma = createClient()
  }
  prisma = global.__prisma
}

export default prisma

