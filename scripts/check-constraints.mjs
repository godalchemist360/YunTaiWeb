import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Pool } from 'pg';

// 載入 .env 檔案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkConstraints() {
  try {
    console.log('檢查資料庫約束...');

    // 檢查 announcements 表的約束
    const constraintsResult = await pool.query(`
      SELECT
        constraint_name,
        constraint_type,
        check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'announcements'
      ORDER BY tc.constraint_type, tc.constraint_name;
    `);

    console.log('announcements 表約束:');
    constraintsResult.rows.forEach((row) => {
      console.log(`  ${row.constraint_name}: ${row.constraint_type}`);
      if (row.check_clause) {
        console.log(`    檢查條件: ${row.check_clause}`);
      }
    });

    // 檢查 type 欄位的允許值
    const typeCheckResult = await pool.query(`
      SELECT
        cc.constraint_name,
        cc.check_clause
      FROM information_schema.check_constraints cc
      WHERE cc.constraint_name = 'announcements_type_check';
    `);

    if (typeCheckResult.rows.length > 0) {
      console.log('\ntype 欄位檢查約束:');
      typeCheckResult.rows.forEach((row) => {
        console.log(`  ${row.constraint_name}: ${row.check_clause}`);
      });
    }

    // 檢查現有的 type 值
    const existingTypesResult = await pool.query(`
      SELECT DISTINCT type FROM announcements ORDER BY type;
    `);

    console.log('\n現有的 type 值:');
    existingTypesResult.rows.forEach((row) => {
      console.log(`  ${row.type}`);
    });
  } catch (error) {
    console.error('檢查約束失敗:', error);
  } finally {
    await pool.end();
  }
}

checkConstraints();
