import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

/**
 * 簡單的資料庫效能測試腳本
 * 用於驗證優化效果
 */

async function testDatabasePerformance() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('🚀 開始資料庫效能測試...\n');

    // 測試基本連線速度
    console.log('1. 測試基本連線速度:');
    const startTime = Date.now();
    await client.query('SELECT 1');
    const connectionTime = Date.now() - startTime;
    console.log(`   連線時間: ${connectionTime}ms`);

    // 測試簡單查詢
    console.log('\n2. 測試簡單查詢:');
    const queryStart = Date.now();
    const result = await client.query('SELECT COUNT(*) FROM "user"');
    const queryTime = Date.now() - queryStart;
    console.log(`   查詢時間: ${queryTime}ms`);
    console.log(`   使用者數量: ${result.rows[0].count}`);

    // 測試索引查詢
    console.log('\n3. 測試索引查詢:');
    const indexStart = Date.now();
    await client.query('SELECT id FROM "user" LIMIT 1');
    const indexTime = Date.now() - indexStart;
    console.log(`   索引查詢時間: ${indexTime}ms`);

    // 測試連線池效能
    console.log('\n4. 測試連線池效能:');
    const poolStart = Date.now();
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(client.query('SELECT 1'));
    }
    await Promise.all(promises);
    const poolTime = Date.now() - poolStart;
    console.log(`   並發查詢時間: ${poolTime}ms`);

    // 總結
    console.log('\n📊 效能總結:');
    console.log(`   基本連線: ${connectionTime}ms`);
    console.log(`   簡單查詢: ${queryTime}ms`);
    console.log(`   索引查詢: ${indexTime}ms`);
    console.log(`   並發查詢: ${poolTime}ms`);

    if (connectionTime < 100 && queryTime < 200 && indexTime < 50) {
      console.log('\n✅ 效能表現良好！');
    } else {
      console.log('\n⚠️  效能可能需要進一步優化');
    }
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await client.end();
  }
}

// 執行測試
testDatabasePerformance().catch(console.error);
