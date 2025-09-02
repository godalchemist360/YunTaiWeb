-- 修復 announcement_read_receipts 表結構的腳本
-- 在 Neon SQL Editor 執行此腳本

-- 1. 檢查現有表結構
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'announcement_read_receipts'
ORDER BY ordinal_position;

-- 2. 檢查是否有 id 欄位
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcement_read_receipts'
    AND column_name = 'id'
  ) THEN
    -- 如果沒有 id 欄位，添加它
    ALTER TABLE announcement_read_receipts
    ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();

    RAISE NOTICE '已添加 id 欄位到 announcement_read_receipts 表';
  ELSE
    RAISE NOTICE 'id 欄位已存在';
  END IF;
END$$;

-- 3. 檢查並添加缺少的欄位
DO $$
BEGIN
  -- 檢查 user_id 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcement_read_receipts'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE announcement_read_receipts
    ADD COLUMN user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE;
    RAISE NOTICE '已添加 user_id 欄位';
  END IF;

  -- 檢查 announcement_id 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcement_read_receipts'
    AND column_name = 'announcement_id'
  ) THEN
    ALTER TABLE announcement_read_receipts
    ADD COLUMN announcement_id text NOT NULL REFERENCES announcements(id) ON DELETE CASCADE;
    RAISE NOTICE '已添加 announcement_id 欄位';
  END IF;

  -- 檢查 read_at 欄位
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcement_read_receipts'
    AND column_name = 'read_at'
  ) THEN
    ALTER TABLE announcement_read_receipts
    ADD COLUMN read_at timestamptz NOT NULL DEFAULT now();
    RAISE NOTICE '已添加 read_at 欄位';
  END IF;
END$$;

-- 4. 檢查並添加唯一約束
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname='uniq_receipt_announcement_user'
      AND conrelid='public.announcement_read_receipts'::regclass
  ) THEN
    ALTER TABLE public.announcement_read_receipts
      ADD CONSTRAINT uniq_receipt_announcement_user
      UNIQUE (announcement_id, user_id);
    RAISE NOTICE '已添加唯一約束 uniq_receipt_announcement_user';
  ELSE
    RAISE NOTICE '唯一約束 uniq_receipt_announcement_user 已存在';
  END IF;
END$$;

-- 5. 檢查並添加索引
DO $$
BEGIN
  -- 檢查 user_id 索引
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'announcement_read_receipts'
    AND indexname = 'idx_receipts_user_id'
  ) THEN
    CREATE INDEX idx_receipts_user_id ON announcement_read_receipts(user_id);
    RAISE NOTICE '已添加 user_id 索引';
  END IF;

  -- 檢查 announcement_id 索引
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'announcement_read_receipts'
    AND indexname = 'idx_receipts_announcement_id'
  ) THEN
    CREATE INDEX idx_receipts_announcement_id ON announcement_read_receipts(announcement_id);
    RAISE NOTICE '已添加 announcement_id 索引';
  END IF;
END$$;

-- 6. 最終檢查表結構
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'announcement_read_receipts'
ORDER BY ordinal_position;

-- 7. 檢查索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'announcement_read_receipts';

-- 8. 檢查約束
SELECT
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.announcement_read_receipts'::regclass;
