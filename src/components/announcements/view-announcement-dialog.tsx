'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  Download,
  Calendar,
} from 'lucide-react';
import {
  getTypeLabel,
  getTypeIcon,
  getTypeColor,
  getTypeTagColor,
  getFileIcon,
  getFileSizeText,
  getStorageTypeText,
  getStorageTypeColor,
  formatDate,
  handleApiError,
  showErrorToast,
} from '@/lib/announcement-utils';
import { useEffect, useRef, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  type: string;
  content: string;
  publishAt: string;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    storageType?: string;
    fileUrl?: string;
    cloudKey?: string;
    checksumSha256?: string;
    createdAt: string;
  }>;
}

interface ViewAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
  onMarkAsRead?: (announcementId: string) => void;
  hasMarkedRead?: Record<string, boolean>;
}

export function ViewAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  onMarkAsRead,
  hasMarkedRead = {},
}: ViewAnnouncementDialogProps) {
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [fullAnnouncement, setFullAnnouncement] = useState<Announcement | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // 計算當前公告的ID，如果沒有公告則為null
  const currentAnnouncementId = announcement?.id || null;

  // 當對話框開啟時，獲取完整的公告詳情
  useEffect(() => {
    if (open && announcement?.id) {
      fetchFullAnnouncement(announcement.id);
    } else {
      setFullAnnouncement(null);
    }
  }, [open, announcement?.id]);

  const fetchFullAnnouncement = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFullAnnouncement(data);
      } else {
        const errorMessage = handleApiError(response, '獲取公告詳情失敗');
        showErrorToast(errorMessage);
        setFullAnnouncement(announcement);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '獲取公告詳情失敗');
      showErrorToast(errorMessage);
      setFullAnnouncement(announcement);
    } finally {
      setLoading(false);
    }
  };

  // 移除重複的函數，使用共用 utility

  const startReadTimer = () => {
    // 如果沒有公告ID或已經標記為已讀，不啟動計時器
    if (!currentAnnouncementId || hasMarkedRead[currentAnnouncementId]) {
      return;
    }

    // 前置條件檢查
    if (!open || !isPageVisible) {
      return;
    }

    // 立即標記為已讀，不需要等待3秒
    markAsRead();
  };

  const markAsRead = async () => {
    try {
      // 調用實際的API
      const response = await fetch(
        `/api/announcements/${currentAnnouncementId}/read`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        // 成功後調用回調函數
        if (onMarkAsRead && currentAnnouncementId) {
          onMarkAsRead(currentAnnouncementId);
        }
      } else {
        const errorMessage = handleApiError(response, '標記已讀失敗');
        showErrorToast(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '標記已讀失敗');
      showErrorToast(errorMessage);
      // 失敗時不更新UI，允許重試
    }
  };

  // 合併所有監聽邏輯到一個 useEffect
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);
    };

    // 添加頁面可見性監聽
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 檢查是否需要啟動已讀計時器
    if (
      open &&
      currentAnnouncementId &&
      !hasMarkedRead[currentAnnouncementId]
    ) {
      startReadTimer();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [open, currentAnnouncementId, hasMarkedRead]);

  const handleDownload = (attachment: any) => {
    // 所有附件都是雲端儲存，開啟新分頁
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    } else {
      showErrorToast('附件 URL 不存在');
    }
  };

  // 移除內嵌播放功能，所有附件統一為下載

  // 如果沒有公告，不渲染對話框
  if (!announcement) return null;

  // 使用完整的公告資料，如果沒有則使用原始資料
  const displayAnnouncement = fullAnnouncement || announcement;
  const IconComponent = getTypeIcon(displayAnnouncement.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(displayAnnouncement.type)} text-white shadow-lg`}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {displayAnnouncement.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeTagColor(displayAnnouncement.type)}`}
                >
                  {getTypeLabel(displayAnnouncement.type)}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(displayAnnouncement.publishAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 公告內容 */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                公告內容
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {displayAnnouncement.content}
                </p>
              </div>
            </div>
          </div>

          {/* 附件區域 */}
          {displayAnnouncement.attachments &&
            displayAnnouncement.attachments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  附件 ({displayAnnouncement.attachments.length})
                </h3>
                <div className="space-y-3">
                  {displayAnnouncement.attachments.map((attachment) => {
                    const FileIcon = getFileIcon(attachment.mimeType);
                    return (
                      <div
                        key={attachment.id}
                        className="space-y-2"
                      >
                        <div
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleDownload(attachment)}
                        >
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {attachment.fileName}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                {attachment.fileSize && (
                                  <span>{getFileSizeText(attachment.fileSize)}</span>
                                )}
                                <span
                                  className={`px-2 py-1 rounded ${getStorageTypeColor(attachment.storageType)}`}
                                >
                                  {getStorageTypeText(attachment.storageType)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            下載
                          </Button>
                        </div>

                        {/* 移除內嵌播放功能，所有附件統一為下載 */}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* 載入中狀態 */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-gray-500">載入中...</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  displayAnnouncement.isRead
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {displayAnnouncement.isRead ? '已讀' : '未讀'}
              </span>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              關閉
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
