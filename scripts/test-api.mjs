import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 載入 .env 檔案
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

async function testAPI() {
  try {
    console.log('測試 API 連接...');

    // 測試 GET /api/announcements
    const listResponse = await fetch('http://localhost:3000/api/announcements');
    console.log('GET /api/announcements 狀態:', listResponse.status);

    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('公告列表:', listData);
    } else {
      console.log('獲取公告列表失敗');
    }

    // 測試 GET /api/announcements/summary
    const summaryResponse = await fetch('http://localhost:3000/api/announcements/summary');
    console.log('GET /api/announcements/summary 狀態:', summaryResponse.status);

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('統計資料:', summaryData);
    } else {
      console.log('獲取統計資料失敗');
    }

    // 測試 POST /api/announcements
    const postResponse = await fetch('http://localhost:3000/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '測試公告',
        type: 'general',
        content: '這是一個測試公告的內容',
        isImportant: false,
        attachments: [],
      }),
    });

    console.log('POST /api/announcements 狀態:', postResponse.status);

    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('新增公告成功:', postData);
    } else {
      const errorData = await postResponse.json().catch(() => ({}));
      console.log('新增公告失敗:', errorData);
    }

  } catch (error) {
    console.error('測試失敗:', error);
  }
}

// 等待一下讓伺服器啟動
setTimeout(testAPI, 2000);
