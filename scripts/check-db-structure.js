/**
 * 檢查資料庫結構的腳本
 * 使用方法：node scripts/check-db-structure.js
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkDatabaseStructure() {
  console.log('🔍 檢查資料庫結構...\n');

  try {
    // 1. 檢查 announcement_read_receipts 表是否存在
    console.log('1. 檢查 announcement_read_receipts 表...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'announcement_read_receipts'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ 表存在');
    } else {
      console.log('❌ 表不存在');
      return;
    }

    // 2. 檢查欄位結構
    console.log('\n2. 檢查欄位結構...');
    const columns = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'announcement_read_receipts'
      ORDER BY ordinal_position;
    `);

    console.log('欄位列表:');
    columns.rows.forEach((col) => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`
      );
    });

    // 3. 檢查是否有 id 欄位
    const hasIdColumn = columns.rows.some((col) => col.column_name === 'id');
    console.log(`\n是否有 id 欄位: ${hasIdColumn ? '✅ 是' : '❌ 否'}`);

    // 4. 檢查約束
    console.log('\n3. 檢查約束...');
    const constraints = await pool.query(`
      SELECT
        conname,
        contype,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'public.announcement_read_receipts'::regclass;
    `);

    console.log('約束列表:');
    constraints.rows.forEach((constraint) => {
      console.log(`  - ${constraint.conname}: ${constraint.definition}`);
    });

    // 5. 檢查索引
    console.log('\n4. 檢查索引...');
    const indexes = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename = 'announcement_read_receipts';
    `);

    console.log('索引列表:');
    indexes.rows.forEach((index) => {
      console.log(`  - ${index.indexname}`);
    });

    // 6. 檢查資料
    console.log('\n5. 檢查資料...');
    const data = await pool.query(`
      SELECT COUNT(*) as count FROM announcement_read_receipts;
    `);
    console.log(`記錄數量: ${data.rows[0].count}`);

    // 7. 測試插入（如果沒有 id 欄位）
    if (!hasIdColumn) {
      console.log('\n⚠️  警告: 沒有 id 欄位，這會導致某些 API 失敗');
      console.log(
        '請執行 scripts/fix-announcement-read-receipts.sql 來修復表結構'
      );
    }
  } catch (error) {
    console.error('❌ 檢查失敗:', error.message);
  } finally {
    await pool.end();
  }
}

// 執行檢查
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkDatabaseStructure().catch(console.error);
}

export { checkDatabaseStructure };
