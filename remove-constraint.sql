-- 移除 announcement_attachments 表的檔案大小限制約束
ALTER TABLE announcement_attachments DROP CONSTRAINT IF EXISTS aa_file_size_limit;

-- 驗證約束已移除
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'announcement_attachments'::regclass;
