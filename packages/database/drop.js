const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.wztujkomctclqbjgrzln:Dersify.ai1@aws-1-eu-central-1.pooler.supabase.com:5432/postgres'
  });
  await client.connect();
  await client.query('DROP TABLE IF EXISTS public.profiles CASCADE;');
  console.log('Dropped profiles table');
  await client.end();
}

main().catch(console.error);
