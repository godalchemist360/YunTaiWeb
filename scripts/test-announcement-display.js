/**
 * 測試公告顯示功能的腳本
 * 使用方法：node scripts/test-announcement-display.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testAnnouncementDisplay() {
  console.log('🧪 開始測試公告顯示功能...\n');

  try {
    // 1. 測試公告列表 API
    console.log('📋 測試公告列表 API...');
    const announcementsRes = await fetch(`${BASE_URL}/api/announcements`, {
      headers: { 'x-user-id': '00000000-0000-0000-0000-000000000001' },
    });

    if (!announcementsRes.ok) {
      console.error(
        `❌ 公告列表 API 失敗: ${announcementsRes.status} ${announcementsRes.statusText}`
      );
      return;
    }

    const announcements = await announcementsRes.json();
    console.log(`✅ 公告列表 API 成功`);
    console.log(`   總數: ${announcements.total}`);
    console.log(`   項目數: ${announcements.items?.length || 0}`);

    if (announcements.items && announcements.items.length > 0) {
      console.log(`   第一則公告: ${announcements.items[0].title}`);
      console.log(
        `   已讀狀態: ${announcements.items[0].isRead ? '已讀' : '未讀'}`
      );
    }

    // 2. 測試統計 API
    console.log('\n📊 測試統計 API...');
    const summaryRes = await fetch(`${BASE_URL}/api/announcements/summary`, {
      headers: { 'x-user-id': '00000000-0000-0000-0000-000000000001' },
    });

    if (!summaryRes.ok) {
      console.error(
        `❌ 統計 API 失敗: ${summaryRes.status} ${summaryRes.statusText}`
      );
      return;
    }

    const summary = await summaryRes.json();
    console.log(`✅ 統計 API 成功`);
    console.log(`   總公告數: ${summary.total}`);
    console.log(`   未讀公告: ${summary.unread}`);
    console.log(`   重要公告: ${summary.important}`);

    // 3. 測試未讀計數 API
    console.log('\n🔢 測試未讀計數 API...');
    const unreadCountRes = await fetch(
      `${BASE_URL}/api/announcements/unread-count`,
      {
        headers: { 'x-user-id': '00000000-0000-0000-0000-000000000001' },
      }
    );

    if (!unreadCountRes.ok) {
      console.error(
        `❌ 未讀計數 API 失敗: ${unreadCountRes.status} ${unreadCountRes.statusText}`
      );
      return;
    }

    const unreadCount = await unreadCountRes.json();
    console.log(`✅ 未讀計數 API 成功`);
    console.log(`   未讀數量: ${unreadCount.unread_count}`);

    // 4. 測試未讀清單 API
    console.log('\n📝 測試未讀清單 API...');
    const unreadListRes = await fetch(`${BASE_URL}/api/announcements/unread`, {
      headers: { 'x-user-id': '00000000-0000-0000-0000-000000000001' },
    });

    if (!unreadListRes.ok) {
      console.error(
        `❌ 未讀清單 API 失敗: ${unreadListRes.status} ${unreadListRes.statusText}`
      );
      return;
    }

    const unreadList = await unreadListRes.json();
    console.log(`✅ 未讀清單 API 成功`);
    console.log(`   未讀清單數量: ${unreadList.length}`);

    // 5. 如果有公告，測試標記已讀功能
    if (announcements.items && announcements.items.length > 0) {
      const firstAnnouncement = announcements.items[0];
      console.log(`\n✅ 測試標記已讀功能...`);
      console.log(`   目標公告: ${firstAnnouncement.title}`);

      const markReadRes = await fetch(
        `${BASE_URL}/api/announcements/${firstAnnouncement.id}/read`,
        {
          method: 'POST',
          headers: { 'x-user-id': '00000000-0000-0000-0000-000000000001' },
        }
      );

      if (!markReadRes.ok) {
        console.error(
          `❌ 標記已讀 API 失敗: ${markReadRes.status} ${markReadRes.statusText}`
        );
      } else {
        const markReadResult = await markReadRes.json();
        console.log(`✅ 標記已讀 API 成功`);
        console.log(`   結果: ${JSON.stringify(markReadResult)}`);
      }
    }

    console.log('\n🎉 所有測試完成！');
    console.log(
      '\n💡 如果所有 API 都成功，但前端仍然顯示「目前沒有公告」，請檢查：'
    );
    console.log('   1. 前端頁面是否正確載入');
    console.log('   2. 瀏覽器開發者工具的 Network 標籤');
    console.log('   3. 瀏覽器開發者工具的 Console 標籤是否有錯誤');
  } catch (error) {
    console.error(`❌ 測試失敗: ${error.message}`);
  }
}

// 執行測試
if (require.main === module) {
  testAnnouncementDisplay().catch(console.error);
}

module.exports = { testAnnouncementDisplay };
