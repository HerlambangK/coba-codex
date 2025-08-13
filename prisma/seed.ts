import { PrismaClient, Role } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient({
  log: [{ emit: 'stdout', level: 'warn' }, { emit: 'stdout', level: 'error' }],
})

async function main() {
  const email = 'admin@example.com'
  const password = 'Admin123!'
  const passwordHash = await argon2.hash(password)

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      isVerified: true,
      password: passwordHash,
    },
    create: {
      email,
      name: 'Admin',
      role: Role.ADMIN,
      isVerified: true,
      password: passwordHash,
    },
  })

  // eslint-disable-next-line no-console
  console.log('Seeded admin user:', email)
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

