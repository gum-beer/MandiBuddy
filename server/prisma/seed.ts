import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seeds the single abc/abc test login called for in the spec. This is a
// throwaway credential for exercising the sign in flow before real auth
// (hashing, sessions/JWT) exists — not meant for real users.
async function main() {
  await prisma.user.upsert({
    where: { username: 'abc' },
    update: {},
    create: { username: 'abc', password: 'abc' },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
