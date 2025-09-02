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
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Info,
} from 'lucide-react';
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
        console.error('獲取公告詳情失敗');
        setFullAnnouncement(announcement);
      }
    } catch (error) {
      console.error('獲取公告詳情失敗:', error);
      setFullAnnouncement(announcement);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'general':
        return '一般';
      case 'important':
        return '重要';
      case 'resource':
        return '資源';
      case 'training':
        return '培訓';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return Info;
      case 'important':
        return AlertTriangle;
      case 'resource':
        return CheckCircle;
      case 'training':
        return Calendar;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'from-blue-500 to-blue-600';
      case 'important':
        return 'from-orange-500 to-red-500';
      case 'resource':
        return 'from-green-500 to-emerald-500';
      case 'training':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getTypeTagColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'important':
        return 'bg-red-100 text-red-800';
      case 'resource':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };



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
        console.error('Failed to mark as read:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
      // 失敗時不更新UI，允許重試
    }
  };

  // 監聽頁面可見性變化
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsPageVisible(isVisible);

      if (isVisible &&
          open &&
          currentAnnouncementId &&
          !hasMarkedRead[currentAnnouncementId]
      ) {
        startReadTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [open, currentAnnouncementId, hasMarkedRead]);

  // 監聽Modal開啟/關閉
  useEffect(() => {
    if (
      open &&
      currentAnnouncementId &&
      !hasMarkedRead[currentAnnouncementId]
    ) {
      startReadTimer();
    }
  }, [open, currentAnnouncementId, hasMarkedRead]);

  // 監聽公告變化
  useEffect(() => {
    if (
      open &&
      currentAnnouncementId &&
      !hasMarkedRead[currentAnnouncementId]
    ) {
      startReadTimer();
    }
  }, [currentAnnouncementId, open, hasMarkedRead]);

  const handleDownload = (attachment: any) => {
    // 使用新的附件下載 API
    const downloadUrl = `/api/announcements/attachments/${attachment.id}`;

    // 創建下載連結
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachment.fileName;
    link.target = '_blank'; // 在新標籤頁開啟
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                <div className="space-y-2">
                  {displayAnnouncement.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleDownload(attachment)}
                    >
                      <div className="flex items-center gap-3">
                        <Download className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attachment.fileName}
                          </p>
                          {attachment.fileSize && (
                            <p className="text-xs text-gray-500">
                              {(attachment.fileSize / 1024 / 1024).toFixed(2)}{' '}
                              MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        下載
                      </Button>
                    </div>
                  ))}
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
