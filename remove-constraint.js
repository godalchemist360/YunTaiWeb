const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function removeConstraint() {
  try {
    const client = await pool.connect();

    console.log('正在移除檔案大小限制約束...');

    // 移除約束
    await client.query(`
      ALTER TABLE announcement_attachments DROP CONSTRAINT IF EXISTS aa_file_size_limit
    `);

    console.log('約束已移除！');

    // 驗證約束已移除
    const result = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'announcement_attachments'::regclass
    `);

    console.log('\n剩餘的約束:');
    result.rows.forEach(row => {
      console.log(`約束名稱: ${row.constraint_name}`);
      console.log(`約束類型: ${row.constraint_type}`);
      console.log(`約束定義: ${row.constraint_definition}`);
      console.log('---');
    });

    client.release();
  } catch (error) {
    console.error('移除約束失敗:', error);
  } finally {
    await pool.end();
  }
}

removeConstraint();
