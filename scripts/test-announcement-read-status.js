/**
 * 測試公告已讀狀態功能的腳本
 * 使用方法：node scripts/test-announcement-read-status.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 測試用的使用者 ID（請根據實際情況調整）
const TEST_USER_IDS = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
];

async function testAnnouncementReadStatus() {
  console.log('🧪 開始測試公告已讀狀態功能...\n');

  for (const userId of TEST_USER_IDS) {
    console.log(`👤 測試使用者: ${userId}`);

    try {
      // 1. 取得公告列表
      console.log('  📋 取得公告列表...');
      const announcementsRes = await fetch(`${BASE_URL}/api/announcements`, {
        headers: { 'x-user-id': userId },
      });
      const announcements = await announcementsRes.json();
      console.log(`    找到 ${announcements.total} 則公告`);

      if (announcements.items.length === 0) {
        console.log('    ⚠️  沒有公告可測試，跳過此使用者');
        continue;
      }

      // 2. 取得未讀數量
      console.log('  🔢 取得未讀數量...');
      const unreadCountRes = await fetch(
        `${BASE_URL}/api/announcements/unread-count`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      const unreadCount = await unreadCountRes.json();
      console.log(`    未讀數量: ${unreadCount.unread_count}`);

      // 3. 標記第一則公告為已讀
      const firstAnnouncement = announcements.items[0];
      console.log(`  ✅ 標記公告 "${firstAnnouncement.title}" 為已讀...`);
      const markReadRes = await fetch(
        `${BASE_URL}/api/announcements/${firstAnnouncement.id}/read`,
        {
          method: 'POST',
          headers: { 'x-user-id': userId },
        }
      );
      const markReadResult = await markReadRes.json();
      console.log(`    標記結果: ${JSON.stringify(markReadResult)}`);

      // 4. 再次取得未讀數量
      console.log('  🔢 再次取得未讀數量...');
      const unreadCountRes2 = await fetch(
        `${BASE_URL}/api/announcements/unread-count`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      const unreadCount2 = await unreadCountRes2.json();
      console.log(`    未讀數量: ${unreadCount2.unread_count}`);

      // 5. 取得未讀清單
      console.log('  📝 取得未讀清單...');
      const unreadListRes = await fetch(
        `${BASE_URL}/api/announcements/unread`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      const unreadList = await unreadListRes.json();
      console.log(`    未讀清單數量: ${unreadList.length}`);

      // 6. 標記所有公告為已讀
      console.log('  ✅ 標記所有公告為已讀...');
      const markAllRes = await fetch(
        `${BASE_URL}/api/announcements/mark-all-read`,
        {
          method: 'POST',
          headers: { 'x-user-id': userId },
        }
      );
      const markAllResult = await markAllRes.json();
      console.log(`    標記結果: ${JSON.stringify(markAllResult)}`);

      // 7. 最終檢查未讀數量
      console.log('  🔢 最終檢查未讀數量...');
      const finalUnreadRes = await fetch(
        `${BASE_URL}/api/announcements/unread-count`,
        {
          headers: { 'x-user-id': userId },
        }
      );
      const finalUnread = await finalUnreadRes.json();
      console.log(`    最終未讀數量: ${finalUnread.unread_count}`);

      console.log('  ✅ 此使用者測試完成\n');
    } catch (error) {
      console.error(`  ❌ 測試失敗: ${error.message}`);
    }
  }

  console.log('🎉 所有測試完成！');
}

// 執行測試
if (require.main === module) {
  testAnnouncementReadStatus().catch(console.error);
}

module.exports = { testAnnouncementReadStatus };
