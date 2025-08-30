import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function insertTestAnnouncements() {
  try {
    console.log('開始插入測試公告資料...');

    // 插入測試公告
    const announcements = [
      {
        title: '系統維護通知',
        content: '系統將進行例行維護，期間可能會有短暫的服務中斷，請提前做好準備。維護期間將無法訪問系統功能，建議提前完成重要操作。',
        type: 'important',
        is_important: true,
        publish_at: new Date('2024-01-15T10:00:00Z'),
      },
      {
        title: '建案資源',
        content: '新增多個優質建案資源，包含住宅、商業地產等多種類型。所有建案均經過嚴格篩選，提供詳細的項目資訊、價格分析和投資回報評估，協助您為客戶提供最佳的投資建議。',
        type: 'resource',
        is_important: false,
        publish_at: new Date('2024-01-10T14:30:00Z'),
      },
      {
        title: '培訓課程安排',
        content: '新系統操作培訓課程將於下週舉行，請各位同仁準時參加。課程將涵蓋系統新功能的使用方法和最佳實踐。',
        type: 'training',
        is_important: false,
        publish_at: new Date('2024-01-20T09:00:00Z'),
      },
      {
        title: '客戶資料更新',
        content: '客戶資料庫已進行全面更新，新增多項重要功能。請各位業務同仁及時查看並熟悉新功能，以提升客戶服務品質。',
        type: 'general',
        is_important: true,
        publish_at: new Date('2024-01-18T16:00:00Z'),
      },
      {
        title: '銷售獎勵方案',
        content: '2024年第一季銷售獎勵方案已正式啟動，包含多項激勵措施和獎金制度。詳細內容請查看附件，如有疑問請聯繫管理部門。',
        type: 'resource',
        is_important: false,
        publish_at: new Date('2024-01-16T11:30:00Z'),
      },
    ];

    for (const announcement of announcements) {
      const result = await pool.query(`
        INSERT INTO announcements (title, content, type, is_important, publish_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [announcement.title, announcement.content, announcement.type, announcement.is_important, announcement.publish_at]);

      console.log(`已插入公告: ${announcement.title} (ID: ${result.rows[0].id})`);
    }

    console.log('測試公告資料插入完成！');
  } catch (error) {
    console.error('插入測試資料失敗:', error);
  } finally {
    await pool.end();
  }
}

insertTestAnnouncements();
