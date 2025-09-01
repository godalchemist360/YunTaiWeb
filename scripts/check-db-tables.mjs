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

async function checkAndCreateTables() {
  try {
    console.log('檢查資料庫表結構...');
    console.log(
      'DATABASE_URL:',
      process.env.DATABASE_URL ? '已設定' : '未設定'
    );

    // 檢查 announcements 表是否存在
    const announcementsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'announcements'
      );
    `);

    if (!announcementsCheck.rows[0].exists) {
      console.log('創建 announcements 表...');
      await pool.query(`
        CREATE TABLE announcements (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          is_important BOOLEAN NOT NULL DEFAULT false,
          content TEXT NOT NULL,
          publish_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('announcements 表創建完成');
    } else {
      console.log('announcements 表已存在');
    }

    // 檢查 announcement_attachments 表是否存在
    const attachmentsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'announcement_attachments'
      );
    `);

    if (!attachmentsCheck.rows[0].exists) {
      console.log('創建 announcement_attachments 表...');
      await pool.query(`
        CREATE TABLE announcement_attachments (
          id TEXT PRIMARY KEY,
          announcement_id TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      console.log('announcement_attachments 表創建完成');
    } else {
      console.log('announcement_attachments 表已存在');
    }

    // 檢查 announcement_read_receipts 表是否存在
    const receiptsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'announcement_read_receipts'
      );
    `);

    if (!receiptsCheck.rows[0].exists) {
      console.log('創建 announcement_read_receipts 表...');
      await pool.query(`
        CREATE TABLE announcement_read_receipts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          announcement_id TEXT NOT NULL,
          read_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, announcement_id)
        );
      `);
      console.log('announcement_read_receipts 表創建完成');
    } else {
      console.log('announcement_read_receipts 表已存在');
    }

    // 檢查現有資料
    const countResult = await pool.query('SELECT COUNT(*) FROM announcements');
    console.log(`目前公告數量: ${countResult.rows[0].count}`);

    console.log('資料庫檢查完成！');
  } catch (error) {
    console.error('檢查資料庫失敗:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateTables();
