-- 建立公告已讀狀態表的 SQL 腳本
-- 在 Neon SQL Editor 執行此腳本

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.announcement_read_receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.app_users(id)       ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now()
);

-- 確保唯一：同一使用者對同一公告只會有一筆
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
  END IF;
END$$;

-- 索引（常用查詢方向）
CREATE INDEX IF NOT EXISTS idx_receipts_user_id
  ON public.announcement_read_receipts(user_id);

CREATE INDEX IF NOT EXISTS idx_receipts_announcement_id
  ON public.announcement_read_receipts(announcement_id);

-- 驗證表結構
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'announcement_read_receipts'
ORDER BY ordinal_position;

-- 驗證索引
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'announcement_read_receipts';
