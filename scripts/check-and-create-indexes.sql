-- 檢查和創建性能優化索引
-- 此腳本可以安全地重複執行（使用 IF NOT EXISTS）

-- 檢查現有索引
DO $$
BEGIN
    RAISE NOTICE '=== 檢查現有索引 ===';
END $$;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('app_users', 'announcements', 'announcement_read_receipts', 'commissions', 'customer_interactions')
ORDER BY tablename, indexname;

-- 1. app_users 表索引（最重要！）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_account 
ON app_users(account);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_id 
ON app_users(id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_role 
ON app_users(role);

-- 2. announcement_read_receipts 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcement_read_receipts_user_announcement 
ON announcement_read_receipts(user_id, announcement_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcement_read_receipts_user_id 
ON announcement_read_receipts(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcement_read_receipts_announcement_id 
ON announcement_read_receipts(announcement_id);

-- 3. announcements 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_created_at_desc 
ON announcements(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_type 
ON announcements(type);

-- 4. commissions 表索引（如果需要的話）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_sales_user_id 
ON commissions(sales_user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_contract_date 
ON commissions(contract_date DESC);

-- 5. customer_interactions 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_created_at_desc 
ON customer_interactions(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_sales_user_id 
ON customer_interactions(sales_user_id);

-- 6. app_users 表額外索引（用於查詢優化）
-- created_at 索引用於排序
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_created_at_desc 
ON app_users(created_at DESC);

-- 複合索引用於常見的查詢模式（狀態+角色）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_status_role 
ON app_users(status, role);

-- 更新表統計資訊（幫助查詢優化器選擇更好的執行計劃）
ANALYZE app_users;
ANALYZE announcements;
ANALYZE announcement_read_receipts;
ANALYZE commissions;
ANALYZE customer_interactions;

-- 顯示創建後的索引
DO $$
BEGIN
    RAISE NOTICE '=== 索引創建完成 ===';
END $$;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('app_users', 'announcements', 'announcement_read_receipts', 'commissions', 'customer_interactions')
ORDER BY tablename, indexname;

