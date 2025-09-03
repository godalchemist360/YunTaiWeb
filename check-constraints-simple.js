const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConstraints() {
  try {
    const client = await pool.connect();

    // 檢查 announcement_attachments 表的約束
    const result = await client.query(`
      SELECT
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition,
        contype as constraint_type
      FROM pg_constraint
      WHERE conrelid = 'announcement_attachments'::regclass
    `);

    console.log('announcement_attachments 表的約束:');
    result.rows.forEach(row => {
      console.log(`約束名稱: ${row.constraint_name}`);
      console.log(`約束類型: ${row.constraint_type}`);
      console.log(`約束定義: ${row.constraint_definition}`);
      console.log('---');
    });

    // 檢查表結構
    const tableResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'announcement_attachments'
      ORDER BY ordinal_position
    `);

    console.log('\nannouncement_attachments 表結構:');
    tableResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    client.release();
  } catch (error) {
    console.error('檢查約束失敗:', error);
  } finally {
    await pool.end();
  }
}

checkConstraints();
