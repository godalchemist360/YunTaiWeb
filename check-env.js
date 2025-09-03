// 環境變數檢查腳本
// 使用方法：node check-env.js

console.log('🔍 檢查環境變數配置...\n');

// 檢查必要的環境變數
const requiredVars = {
  'DATABASE_URL': '資料庫連接字串',
  'STORAGE_REGION': '儲存區域',
  'STORAGE_BUCKET_NAME': '儲存桶名稱',
  'STORAGE_ACCESS_KEY_ID': '存取金鑰 ID',
  'STORAGE_SECRET_ACCESS_KEY': '秘密存取金鑰',
  'STORAGE_ENDPOINT': '儲存端點',
  'STORAGE_PUBLIC_URL': '公開 URL'
};

console.log('📋 必要環境變數檢查：');
let allRequiredVarsOk = true;

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value) {
    // 隱藏敏感資訊
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      const maskedValue = value.length > 8 ?
        `${value.substring(0, 4)}...${value.substring(value.length - 4)}` :
        '***';
      console.log(`✅ ${varName}: ${maskedValue} (${description})`);
    } else {
      console.log(`✅ ${varName}: ${value} (${description})`);
    }
  } else {
    console.log(`❌ ${varName}: 未設定 (${description})`);
    allRequiredVarsOk = false;
  }
});

console.log('\n🔧 儲存配置檢查：');
const storageConfig = {
  region: process.env.STORAGE_REGION,
  bucketName: process.env.STORAGE_BUCKET_NAME,
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  endpoint: process.env.STORAGE_ENDPOINT,
  publicUrl: process.env.STORAGE_PUBLIC_URL
};

// 檢查 Cloudflare R2 特定配置
if (storageConfig.endpoint && storageConfig.endpoint.includes('r2.cloudflarestorage.com')) {
  console.log('✅ 檢測到 Cloudflare R2 配置');

  // 檢查 R2 配置是否完整
  if (storageConfig.region && storageConfig.bucketName && storageConfig.accessKeyId && storageConfig.secretAccessKey) {
    console.log('✅ R2 配置完整');
  } else {
    console.log('❌ R2 配置不完整');
  }
} else if (storageConfig.endpoint) {
  console.log('ℹ️  檢測到其他 S3 相容儲存服務');
} else {
  console.log('❌ 未檢測到儲存端點配置');
}

console.log('\n📊 配置摘要：');
console.log(`儲存區域: ${storageConfig.region || '未設定'}`);
console.log(`儲存桶: ${storageConfig.bucketName || '未設定'}`);
console.log(`端點: ${storageConfig.endpoint || '未設定'}`);
console.log(`公開 URL: ${storageConfig.publicUrl || '未設定'}`);

console.log('\n🚀 下一步建議：');
if (allRequiredVarsOk) {
  console.log('✅ 所有必要環境變數都已設定！');
  console.log('💡 現在可以測試檔案上傳功能了');
} else {
  console.log('❌ 有環境變數未設定');
  console.log('💡 請檢查 .env 檔案並設定缺少的變數');
  console.log('💡 參考 env.example 檔案中的範例');
}

// 檢查 .env 檔案是否存在
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env 檔案存在');

  // 讀取 .env 檔案內容（不顯示敏感資訊）
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');

  console.log(`📄 .env 檔案包含 ${lines.length} 行`);

  // 檢查是否有註解或空行
  const nonEmptyLines = lines.filter(line => line.trim() && !line.startsWith('#'));
  console.log(`📝 非空行數量: ${nonEmptyLines.length}`);

} else {
  console.log('\n❌ .env 檔案不存在');
  console.log('💡 請創建 .env 檔案並設定必要的環境變數');
}
