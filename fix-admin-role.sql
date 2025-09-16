-- 檢查 app_users 表中的用戶資料
SELECT id, account, display_name, role, status FROM app_users ORDER BY id;

-- 如果 admin 用戶的 role 為空，設定為 'admin'
UPDATE app_users
SET role = 'admin'
WHERE account = 'admin' AND (role IS NULL OR role = '');

-- 檢查更新結果
SELECT id, account, display_name, role, status FROM app_users WHERE account = 'admin';

-- 如果需要，也可以為其他用戶設定預設角色
-- UPDATE app_users
-- SET role = 'sales'
-- WHERE role IS NULL OR role = '';

-- 最終檢查所有用戶的角色
SELECT id, account, display_name, role, status FROM app_users ORDER BY id;
