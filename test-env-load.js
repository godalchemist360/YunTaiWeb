const fs = require('fs');
const path = require('path');

console.log(' 手動載入 .env 檔案...\n');

// 手動讀取和解析 .env 檔案
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    const envVars = {};
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            if (trimmed.includes('=')) {
                const parts = trimmed.split('=', 2);
                if (parts.length === 2) {
                    const key = parts[0].trim();
                    let value = parts[1].trim();
                    
                    // 移除引號
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    envVars[key] = value;
                }
            }
        }
    });
    
    console.log(' 從 .env 檔案讀取的環境變數：');
    Object.entries(envVars).forEach(([key, value]) => {
        if (key.includes('SECRET') || key.includes('KEY')) {
            const maskedValue = value.length > 8 ? 
                ${value.substring(0, 4)}... : 
                '***';
            console.log( : );
        } else {
            console.log( : );
        }
    });
    
    // 檢查儲存相關變數
    console.log('\n 儲存配置檢查：');
    const storageVars = ['STORAGE_REGION', 'STORAGE_BUCKET_NAME', 'STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_ENDPOINT', 'STORAGE_PUBLIC_URL'];
    
    storageVars.forEach(varName => {
        if (envVars[varName]) {
            console.log( : );
        } else {
            console.log( : 未設定);
        }
    });
    
} else {
    console.log(' .env 檔案不存在');
}
