import { Pool } from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 載入 .env 檔案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkTableStructure() {
  try {
    console.log('檢查 announcements 表結構...');

    // 檢查表結構
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'announcements'
      ORDER BY ordinal_position;
    `);

    console.log('announcements 表結構:');
    structureResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // 檢查主鍵
    const primaryKeyResult = await pool.query(`
      SELECT constraint_name, column_name
      FROM information_schema.key_column_usage
      WHERE table_name = 'announcements' AND constraint_name LIKE '%_pkey';
    `);

    console.log('\n主鍵資訊:');
    primaryKeyResult.rows.forEach(row => {
      console.log(`  ${row.constraint_name}: ${row.column_name}`);
    });

    // 檢查現有資料
    const dataResult = await pool.query('SELECT id, title, type FROM announcements LIMIT 3');
    console.log('\n現有資料範例:');
    dataResult.rows.forEach(row => {
      console.log(`  ID: ${row.id}, 標題: ${row.title}, 類型: ${row.type}`);
    });

  } catch (error) {
    console.error('檢查表結構失敗:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
