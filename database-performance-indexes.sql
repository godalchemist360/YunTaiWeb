-- 資料庫性能優化索引
-- 執行此腳本以提升 API 查詢速度

-- 1. customer_interactions 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_created_at_desc
ON customer_interactions(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_customer_name
ON customer_interactions(customer_name);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_salesperson
ON customer_interactions(salesperson);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_interactions_lead_source
ON customer_interactions(lead_source);

-- 2. announcements 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_created_at_desc
ON announcements(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_type
ON announcements(type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcements_title_search
ON announcements USING gin(to_tsvector('chinese', title));

-- 3. announcement_read_receipts 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_announcement_read_receipts_user_announcement
ON announcement_read_receipts(user_id, announcement_id);

-- 4. app_users 表索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_account
ON app_users(account);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_role
ON app_users(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_users_status
ON app_users(status);

-- 5. 更新表統計資訊
ANALYZE customer_interactions;
ANALYZE announcements;
ANALYZE announcement_read_receipts;
ANALYZE app_users;

-- 顯示創建的索引
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('customer_interactions', 'announcements', 'announcement_read_receipts', 'app_users')
ORDER BY tablename, indexname;
