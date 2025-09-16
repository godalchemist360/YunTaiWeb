-- 自動登出和會話管理功能所需的資料庫變更
-- 執行前請先備份資料庫

-- 1. 為 app_users 表添加 last_activity 欄位
ALTER TABLE app_users
ADD COLUMN last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. 創建索引以提高查詢性能
CREATE INDEX idx_app_users_last_activity ON app_users(last_activity);

-- 3. 更新現有記錄的 last_activity 為當前時間
UPDATE app_users SET last_activity = CURRENT_TIMESTAMP WHERE last_activity IS NULL;

-- 4. 驗證變更
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 5. 檢查索引是否創建成功
SELECT
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename = 'app_users'
AND indexname = 'idx_app_users_last_activity';
