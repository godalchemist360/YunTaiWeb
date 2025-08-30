import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkAnnouncements() {
  try {
    console.log('🔍 檢查公告資料庫...\n');

    // 檢查公告表
    console.log('1. 檢查 announcements 表結構:');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'announcements'
      ORDER BY ordinal_position
    `);
    console.log(tableInfo.rows);
    console.log('');

    // 檢查公告數量
    console.log('2. 檢查公告總數:');
    const countResult = await pool.query('SELECT COUNT(*) as count FROM announcements');
    console.log(`總公告數: ${countResult.rows[0].count}`);
    console.log('');

    // 檢查所有公告
    console.log('3. 檢查所有公告:');
    const announcements = await pool.query(`
      SELECT
        id,
        title,
        type,
        is_important,
        publish_at,
        created_at,
        updated_at
      FROM announcements
      ORDER BY publish_at DESC
    `);

    if (announcements.rows.length === 0) {
      console.log('❌ 沒有找到任何公告');
    } else {
      console.log(`✅ 找到 ${announcements.rows.length} 個公告:`);
      announcements.rows.forEach((announcement, index) => {
        console.log(`  ${index + 1}. ${announcement.title} (${announcement.type}) - ${announcement.publish_at}`);
      });
    }
    console.log('');

    // 檢查附件
    console.log('4. 檢查附件:');
    const attachments = await pool.query(`
      SELECT
        aa.id,
        aa.announcement_id,
        aa.file_name,
        aa.file_url,
        aa.file_size,
        a.title as announcement_title
      FROM announcement_attachments aa
      LEFT JOIN announcements a ON a.id = aa.announcement_id
      ORDER BY aa.created_at DESC
    `);

    if (attachments.rows.length === 0) {
      console.log('❌ 沒有找到任何附件');
    } else {
      console.log(`✅ 找到 ${attachments.rows.length} 個附件:`);
      attachments.rows.forEach((attachment, index) => {
        console.log(`  ${index + 1}. ${attachment.file_name} (${attachment.announcement_title})`);
      });
    }
    console.log('');

    // 檢查已讀回條
    console.log('5. 檢查已讀回條:');
    const readReceipts = await pool.query(`
      SELECT
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT announcement_id) as unique_announcements
      FROM announcement_read_receipts
    `);
    console.log(`總已讀記錄: ${readReceipts.rows[0].count}`);
    console.log(`唯一用戶數: ${readReceipts.rows[0].unique_users}`);
    console.log(`唯一公告數: ${readReceipts.rows[0].unique_announcements}`);
    console.log('');

    // 測試 API 查詢
    console.log('6. 測試 API 查詢邏輯:');
    const userId = '00000000-0000-0000-0000-000000000001';

    const apiQuery = `
      SELECT
        a.id,
        a.title,
        a.type,
        a.is_important AS "isImportant",
        a.publish_at AS "publishAt",
        (rr.user_id IS NOT NULL) AS "isRead",
        SUBSTRING(a.content,1,160) AS "contentPreview",
        COALESCE(att.attachment_count, 0) AS "attachmentCount"
      FROM announcements a
      LEFT JOIN announcement_read_receipts rr
        ON rr.announcement_id = a.id AND rr.user_id = $1
      LEFT JOIN (
        SELECT
          announcement_id,
          COUNT(*) as attachment_count
        FROM announcement_attachments
        GROUP BY announcement_id
      ) att ON att.announcement_id = a.id
      ORDER BY a.publish_at DESC
      LIMIT 10 OFFSET 0
    `;

    const apiResult = await pool.query(apiQuery, [userId]);
    console.log(`API 查詢結果: ${apiResult.rows.length} 個公告`);
    apiResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.title} (${row.type}) - 已讀: ${row.isRead} - 附件: ${row.attachmentCount}`);
    });

  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  } finally {
    await pool.end();
  }
}

checkAnnouncements();
