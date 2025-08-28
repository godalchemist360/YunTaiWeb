import 'dotenv/config';
import bcrypt from 'bcryptjs'; // ← 用 bcryptjs
import pkg from 'pg';
const { Client } = pkg;

const account = 'admin';
const password = 'Test@12345';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const passwordHash = await bcrypt.hash(password, 12);
  await client.query(
    `insert into app_users (account, password_hash)
     values ($1, $2)
     on conflict (account) do nothing`,
    [account, passwordHash]
  );

  console.log('✅ 已建立/確保帳號存在：', account);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
