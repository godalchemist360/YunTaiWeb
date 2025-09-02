/**
 * 公告已讀狀態相關的前端工具函數
 */

/**
 * 標記某公告為已讀
 */
export async function markAsRead(
  announcementId: string
): Promise<{ ok: boolean; receipt_id?: string; read_at?: string }> {
  const res = await fetch(`/api/announcements/${announcementId}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to mark as read: ${res.statusText}`);
  }

  return res.json();
}

/**
 * 取得未讀公告數量
 */
export async function getUnreadCount(): Promise<number> {
  const res = await fetch('/api/announcements/unread-count', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get unread count: ${res.statusText}`);
  }

  const data = await res.json();
  return data.unread_count ?? 0;
}

/**
 * 取得未讀公告清單
 */
export async function getUnreadAnnouncements(): Promise<
  Array<{
    id: string;
    title: string;
    publish_at: string;
  }>
> {
  const res = await fetch('/api/announcements/unread', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get unread announcements: ${res.statusText}`);
  }

  return res.json();
}

/**
 * 標記所有公告為已讀
 */
export async function markAllAsRead(): Promise<{
  ok: boolean;
  newly_marked: number;
}> {
  const res = await fetch('/api/announcements/mark-all-read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to mark all as read: ${res.statusText}`);
  }

  return res.json();
}

/**
 * 取得公告列表（包含已讀狀態）
 */
export async function getAnnouncements(params?: {
  filter?: 'all' | 'unread' | 'important';
  type?: 'all' | 'general' | 'important' | 'resource' | 'training';
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<{
  items: Array<{
    id: string;
    title: string;
    type: string;
    publishAt: string;
    isRead: boolean;
    readAt?: string;
    contentPreview: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
}> {
  const searchParams = new URLSearchParams();

  if (params?.filter) searchParams.set('filter', params.filter);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize)
    searchParams.set('pageSize', params.pageSize.toString());
  if (params?.q) searchParams.set('q', params.q);

  const res = await fetch(`/api/announcements?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get announcements: ${res.statusText}`);
  }

  return res.json();
}

/**
 * 取得公告詳情（包含已讀狀態）
 */
export async function getAnnouncement(id: string): Promise<{
  id: string;
  title: string;
  content: string;
  type: string;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    checksumSha256?: string;
    createdAt: string;
  }>;
}> {
  const res = await fetch(`/api/announcements/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to get announcement: ${res.statusText}`);
  }

  return res.json();
}
