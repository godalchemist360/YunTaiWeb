# 公告已讀狀態功能實作

## 概述

本專案已實作完整的公告已讀狀態功能，支援每位使用者獨立的已讀狀態追蹤。

## 功能特色

- ✅ 每位使用者的已讀狀態獨立管理
- ✅ 同一使用者對同一公告最多 1 筆已讀紀錄
- ✅ 支援標記單則公告為已讀
- ✅ 支援標記所有公告為已讀
- ✅ 提供未讀數量統計
- ✅ 提供未讀清單查詢
- ✅ 自動級聯刪除（刪除公告時自動清理已讀紀錄）

## 資料庫結構

### announcement_read_receipts 表

```sql
CREATE TABLE public.announcement_read_receipts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now()
);

-- 唯一約束：確保同一使用者對同一公告只會有一筆紀錄
ALTER TABLE public.announcement_read_receipts
  ADD CONSTRAINT uniq_receipt_announcement_user
  UNIQUE (announcement_id, user_id);

-- 索引優化查詢效能
CREATE INDEX idx_receipts_user_id ON public.announcement_read_receipts(user_id);
CREATE INDEX idx_receipts_announcement_id ON public.announcement_read_receipts(announcement_id);
```

## API 端點

### 1. 公告列表（包含已讀狀態）
```
GET /api/announcements
```

**查詢參數：**
- `filter`: `all` | `unread` | `important`
- `type`: `all` | `general` | `important` | `resource` | `training`
- `page`: 頁碼（預設：1）
- `pageSize`: 每頁數量（預設：10，最大：100）
- `q`: 搜尋關鍵字

**回應範例：**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "公告標題",
      "type": "general",
      "isImportant": false,
      "publishAt": "2024-01-01T00:00:00Z",
      "isRead": true,
      "readAt": "2024-01-01T10:00:00Z",
      "contentPreview": "公告內容預覽..."
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 25
}
```

### 2. 公告詳情（包含已讀狀態）
```
GET /api/announcements/{id}
```

**回應範例：**
```json
{
  "id": "uuid",
  "title": "公告標題",
  "content": "完整公告內容",
  "type": "general",
  "isImportant": false,
  "publishAt": "2024-01-01T00:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isRead": true,
  "readAt": "2024-01-01T10:00:00Z",
  "attachments": [...]
}
```

### 3. 標記公告為已讀
```
POST /api/announcements/{id}/read
```

**回應範例：**
```json
{
  "ok": true,
  "receipt_id": "uuid",
  "read_at": "2024-01-01T10:00:00Z"
}
```

### 4. 標記所有公告為已讀
```
POST /api/announcements/mark-all-read
```

**回應範例：**
```json
{
  "ok": true,
  "newly_marked": 5
}
```

### 5. 取得未讀數量
```
GET /api/announcements/unread-count
```

**回應範例：**
```json
{
  "unread_count": 3
}
```

### 6. 取得未讀清單
```
GET /api/announcements/unread
```

**回應範例：**
```json
[
  {
    "id": "uuid",
    "title": "未讀公告標題",
    "publish_at": "2024-01-01T00:00:00Z"
  }
]
```

## 前端使用範例

### 使用工具函數

```typescript
import {
  markAsRead,
  getUnreadCount,
  getUnreadAnnouncements,
  markAllAsRead,
  getAnnouncements,
  getAnnouncement
} from '@/lib/announcements'

// 標記單則公告為已讀
await markAsRead('announcement-id')

// 取得未讀數量
const unreadCount = await getUnreadCount()

// 取得未讀清單
const unreadList = await getUnreadAnnouncements()

// 標記所有公告為已讀
await markAllAsRead()

// 取得公告列表（包含已讀狀態）
const announcements = await getAnnouncements({
  filter: 'unread',
  page: 1,
  pageSize: 10
})

// 取得公告詳情（包含已讀狀態）
const announcement = await getAnnouncement('announcement-id')
```

### React 組件範例

```tsx
'use client'

import { useState, useEffect } from 'react'
import { getUnreadCount, markAsRead } from '@/lib/announcements'

export function AnnouncementBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount()
        setUnreadCount(count)
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }

    fetchUnreadCount()
    // 每 30 秒更新一次
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (unreadCount === 0) return null

  return (
    <span className="badge badge-error">
      {unreadCount}
    </span>
  )
}

export function AnnouncementDetail({ id }: { id: string }) {
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getAnnouncement(id)
        setAnnouncement(data)

        // 自動標記為已讀
        if (!data.isRead) {
          await markAsRead(id)
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error)
      }
    }

    fetchAnnouncement()
  }, [id])

  if (!announcement) return <div>載入中...</div>

  return (
    <div>
      <h1>{announcement.title}</h1>
      <p>{announcement.content}</p>
      {announcement.isRead && (
        <small>已讀於 {new Date(announcement.readAt).toLocaleString()}</small>
      )}
    </div>
  )
}
```

## 認證機制

目前使用 `x-user-id` header 進行開發測試，實際部署時請：

1. 修改 `src/lib/auth.ts` 中的 `getCurrentUserId` 函數
2. 實作正確的 session 驗證邏輯
3. 移除開發用的 header 驗證

## 測試

執行測試腳本：

```bash
node scripts/test-announcement-read-status.js
```

## 部署注意事項

1. **資料庫遷移**：確保在 Neon SQL Editor 執行 `scripts/create-announcement-read-receipts.sql`
2. **認證整合**：根據實際認證系統調整 `getCurrentUserId` 函數
3. **效能監控**：監控已讀狀態查詢的效能，必要時調整索引
4. **資料清理**：定期清理過期的已讀紀錄（可選）

## 技術架構

- **後端**：Next.js App Router + TypeScript
- **資料庫**：PostgreSQL (Neon) + Drizzle ORM
- **認證**：Better Auth（可自訂）
- **API**：RESTful API 設計
- **前端**：React + TypeScript

## 效能考量

- 使用適當的資料庫索引優化查詢
- 實作快取機制減少資料庫查詢
- 支援分頁避免大量資料載入
- 使用 upsert 避免重複插入

## 安全性

- 所有 API 都需要使用者認證
- 使用參數化查詢防止 SQL 注入
- 實作適當的錯誤處理
- 支援 CORS 設定（如需要）
