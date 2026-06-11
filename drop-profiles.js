const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.wztujkomctclqbjgrzln:Dersify.ai1@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'
    }
  }
});

async function main() {
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS public.profiles CASCADE;');
  console.log('Dropped profiles table');
}

main().catch(console.error).finally(() => prisma.$disconnect());
