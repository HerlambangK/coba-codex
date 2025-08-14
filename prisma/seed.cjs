const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
})

async function main() {
  // Quick connectivity check
  await prisma.$queryRaw`SELECT 1`

  const email = 'admin@example.com'
  const password = 'Admin123!'
  const passwordHash = await argon2.hash(password)

  await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      isVerified: true,
      password: passwordHash,
    },
    create: {
      email,
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
      password: passwordHash,
    },
  })

  console.log('Seeded admin user:', email)
}

main()
  .catch((e) => {
    const msg = e && e.message ? e.message : String(e)
    if (/does not exist|relation .* does not exist/i.test(msg)) {
      console.error('\n[seed] Tables missing. Run:\n  npx prisma db push\nthen re-run seeding.')
    } else {
      console.error('[seed] Error:', msg)
    }
    process.exitCode = 1
  })
  .finally(async () => {
    prisma.$disconnect()
  })
