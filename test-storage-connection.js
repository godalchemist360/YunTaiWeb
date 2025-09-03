// 使用 ES 模組格式
import 'dotenv/config';
import { s3mini } from 's3mini';

async function testStorageConnection() {
  console.log('🔍 測試儲存連接...\n');

  // 檢查環境變數
  const requiredEnvVars = [
    'STORAGE_REGION',
    'STORAGE_BUCKET_NAME',
    'STORAGE_ACCESS_KEY_ID',
    'STORAGE_SECRET_ACCESS_KEY',
    'STORAGE_ENDPOINT',
    'STORAGE_PUBLIC_URL'
  ];

  console.log('📋 檢查環境變數：');
  let envVarsOk = true;

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('SECRET') || varName.includes('KEY')) {
        const maskedValue = value.length > 8 ?
          value.substring(0, 4) + '...' + value.substring(value.length - 4) :
          '***';
        console.log(`✅ ${varName}: ${maskedValue}`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: 未設定`);
      envVarsOk = false;
    }
  });

  if (!envVarsOk) {
    console.log('\n❌ 環境變數設定不完整，無法測試連接');
    return;
  }

  console.log('\n🔧 測試儲存連接...');

  try {
    // 創建 S3 客戶端
    const endpointWithBucket = `${process.env.STORAGE_ENDPOINT.replace(/\/$/, '')}/${process.env.STORAGE_BUCKET_NAME}`;

    console.log(`端點: ${endpointWithBucket}`);
    console.log(`區域: ${process.env.STORAGE_REGION}`);

    const s3 = new s3mini({
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      endpoint: endpointWithBucket,
      region: process.env.STORAGE_REGION,
    });

    console.log('✅ S3 客戶端創建成功');

    // 測試連接 - 列出物件
    console.log('\n📋 測試列出儲存桶物件...');

    try {
      const objects = await s3.listObjects();
      console.log(`✅ 成功連接到儲存桶，找到 ${objects.length} 個物件`);

      if (objects.length > 0) {
        console.log('📁 前 5 個物件：');
        objects.slice(0, 5).forEach((obj, index) => {
          console.log(`  ${index + 1}. ${obj.key} (${obj.size} bytes)`);
        });
      }
    } catch (listError) {
      console.log('⚠️  列出物件失敗（可能是空儲存桶或權限問題）：', listError.message);
    }

    // 測試上傳小檔案
    console.log('\n📤 測試上傳小檔案...');

    const testContent = 'Hello, this is a test file for storage connection!';
    const testKey = `test-connection-${Date.now()}.txt`;

    try {
      const uploadResult = await s3.putObject(testKey, testContent, 'text/plain');

      if (uploadResult.ok) {
        console.log(`✅ 測試檔案上傳成功: ${testKey}`);

        // 測試下載
        console.log('📥 測試公開端點下載...');
        const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${testKey}`;
        console.log('�� 公開下載 URL:', publicUrl);

        try {
          const response = await fetch(publicUrl);
          if (response.ok) {
            const downloadedContent = await response.text();
            if (downloadedContent === testContent) {
              console.log('✅ 測試檔案下載成功，內容正確');
            } else {
              console.log('⚠️  下載的檔案內容不匹配');
              console.log('原始內容:', testContent);
              console.log('下載內容:', downloadedContent);
            }
          } else {
            console.log('❌ 測試檔案下載失敗:', response.status, response.statusText);
          }
        } catch (downloadError) {
          console.log('❌ 測試檔案下載失敗:', downloadError.message);
        }

        // 清理測試檔案
        console.log('🧹 清理測試檔案...');
        try {
          const deleteResult = await s3.deleteObject(testKey);
          if (deleteResult) {
            console.log('✅ 測試檔案清理成功');
          } else {
            console.log('⚠️  測試檔案清理失敗');
          }
        } catch (deleteError) {
          console.log('⚠️  測試檔案清理失敗:', deleteError.message);
        }

      } else {
        console.log('❌ 測試檔案上傳失敗:', uploadResult.statusText);
      }
    } catch (uploadError) {
      console.log('❌ 測試檔案上傳失敗:', uploadError.message);
    }

    console.log('\n�� 儲存連接測試完成！');

  } catch (error) {
    console.error('❌ 儲存連接測試失敗:', error.message);
    console.error('錯誤詳情:', error);

    // 提供故障排除建議
    console.log('\n🔧 故障排除建議：');
    console.log('1. 檢查 Cloudflare R2 儲存桶是否已創建');
    console.log('2. 檢查 API 金鑰權限是否正確');
    console.log('3. 檢查網路連接是否正常');
    console.log('4. 檢查儲存桶權限設定');
    console.log('5. 檢查端點 URL 是否正確');
  }
}

// 執行測試
testStorageConnection().catch(console.error);
