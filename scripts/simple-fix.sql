-- 簡化的修復腳本
-- 在 Neon SQL Editor 執行此腳本

-- 1. 檢查現有結構
SELECT 'Current table structure:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'announcement_read_receipts' ORDER BY ordinal_position;

-- 2. 添加 id 欄位（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcement_read_receipts' AND column_name = 'id'
  ) THEN
    ALTER TABLE announcement_read_receipts ADD COLUMN id uuid DEFAULT gen_random_uuid();
    RAISE NOTICE 'Added id column';
  ELSE
    RAISE NOTICE 'id column already exists';
  END IF;
END$$;

-- 3. 設置主鍵（如果沒有）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'announcement_read_receipts'::regclass
    AND contype = 'p'
  ) THEN
    ALTER TABLE announcement_read_receipts ADD PRIMARY KEY (id);
    RAISE NOTICE 'Added primary key';
  ELSE
    RAISE NOTICE 'Primary key already exists';
  END IF;
END$$;

-- 4. 添加唯一約束（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uniq_receipt_announcement_user'
  ) THEN
    ALTER TABLE announcement_read_receipts
    ADD CONSTRAINT uniq_receipt_announcement_user
    UNIQUE (announcement_id, user_id);
    RAISE NOTICE 'Added unique constraint';
  ELSE
    RAISE NOTICE 'Unique constraint already exists';
  END IF;
END$$;

-- 5. 最終檢查
SELECT 'Final table structure:' as info;
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'announcement_read_receipts' ORDER BY ordinal_position;
