import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

/**
 * 簡化的資料庫索引優化分析腳本
 * 專注於基本的索引檢查和建議
 */

async function analyzeIndexes() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('🔍 開始分析資料庫索引...\n');

    // 1. 檢查現有索引
    console.log('📊 現有索引統計:');
    const indexStats = await client.query(`
      SELECT
        tablename,
        indexname,
        idx_scan as index_scans
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
    `);

    console.table(indexStats.rows);

    // 2. 檢查未使用的索引
    console.log('\n🚫 未使用的索引 (可能可以刪除):');
    const unusedIndexes = await client.query(`
      SELECT
        tablename,
        indexname
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      ORDER BY tablename, indexname
    `);

    if (unusedIndexes.rows.length > 0) {
      console.table(unusedIndexes.rows);
    } else {
      console.log('✅ 沒有發現未使用的索引');
    }

    // 3. 檢查連線統計
    console.log('\n🔗 連線統計:');
    const connectionStats = await client.query(`
      SELECT
        state,
        count(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `);

    console.table(connectionStats.rows);

    // 4. 基本優化建議
    console.log('\n💡 基本優化建議:');
    console.log('- 確保 user_credit 表的 user_id 有索引');
    console.log('- 確保 credit_transaction 表的 user_id 和 type 有複合索引');
    console.log('- 確保 payment 表的 user_id 和 status 有複合索引');
    console.log('- 定期清理未使用的索引');
  } catch (error) {
    console.error('❌ 分析過程中發生錯誤:', error);
  } finally {
    await client.end();
  }
}

/**
 * 建立基本索引
 */
async function createBasicIndexes() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('🔧 建立基本索引...\n');

    const basicIndexes = [
      // 積分交易表的複合索引
      {
        name: 'credit_transaction_user_type_idx',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS credit_transaction_user_type_idx
              ON credit_transaction (user_id, type)`,
      },

      // 付款表的複合索引
      {
        name: 'payment_user_status_idx',
        sql: `CREATE INDEX CONCURRENTLY IF NOT EXISTS payment_user_status_idx
              ON payment (user_id, status)`,
      },
    ];

    for (const index of basicIndexes) {
      try {
        console.log(`建立索引: ${index.name}`);
        await client.query(index.sql);
        console.log(`✅ ${index.name} 建立成功`);
      } catch (error) {
        console.log(`❌ ${index.name} 建立失敗:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ 建立索引過程中發生錯誤:', error);
  } finally {
    await client.end();
  }
}

// 主執行函數
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
      await analyzeIndexes();
      break;
    case 'create-indexes':
      await createBasicIndexes();
      break;
    default:
      console.log('使用方法:');
      console.log('  node optimize-db-indexes.mjs analyze        # 分析索引');
      console.log(
        '  node optimize-db-indexes.mjs create-indexes  # 建立基本索引'
      );
      break;
  }
}

main().catch(console.error);
