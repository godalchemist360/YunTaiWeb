require('dotenv').config();

console.log('🔍 使用 dotenv 載入環境變數...\n');

console.log('📋 環境變數檢查：');
const requiredVars = {
  DATABASE_URL: '資料庫連接字串',
  STORAGE_REGION: '儲存區域',
  STORAGE_BUCKET_NAME: '儲存桶名稱',
  STORAGE_ACCESS_KEY_ID: '存取金鑰 ID',
  STORAGE_SECRET_ACCESS_KEY: '秘密存取金鑰',
  STORAGE_ENDPOINT: '儲存端點',
  STORAGE_PUBLIC_URL: '公開 URL',
};

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      const maskedValue =
        value.length > 8
          ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
          : '***';
      console.log(`✅ ${varName}: ${maskedValue} (${description})`);
    } else {
      console.log(`✅ ${varName}: ${value} (${description})`);
    }
  } else {
    console.log(`❌ ${varName}: 未設定 (${description})`);
  }
});
