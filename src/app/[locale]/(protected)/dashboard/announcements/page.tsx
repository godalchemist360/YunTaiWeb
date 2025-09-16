'use client';

import { AddAnnouncementDialog } from '@/components/announcements/add-announcement-dialog';
import { ViewAnnouncementDialog } from '@/components/announcements/view-announcement-dialog';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UserAvatar } from '@/components/layout/user-avatar';
import {
  AnnouncementCreateGate,
  AnnouncementDeleteGate,
} from '@/components/permission-gate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  formatDate,
  getTypeColor,
  getTypeIcon,
  getTypeLabel,
  getTypeTagColor,
  handleApiError,
  showErrorToast,
  showSuccessToast,
} from '@/lib/announcement-utils';
import {
  extractPermissionError,
  handlePermissionError,
  showPermissionError,
} from '@/lib/permission-utils';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Info,
  Megaphone,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  type: 'general' | 'important' | 'resource' | 'training';
  publishAt: string;
  contentPreview: string;
  isRead: boolean;
}

interface Summary {
  total: number;
  unread: number;
  important: number;
}

export default function AnnouncementsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unread' | 'important'
  >('all');
  const [hasMarkedRead, setHasMarkedRead] = useState<Record<string, boolean>>(
    {}
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    unread: 0,
    important: 0,
  });
  const [loading, setLoading] = useState(true);

  // 刪除確認對話框狀態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // 載入公告列表
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const filter = activeFilter === 'all' ? 'all' : activeFilter;
      const response = await fetch(`/api/announcements?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.items || []);
      } else {
        const errorMessage = handleApiError(response, '載入公告失敗');
        showErrorToast(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '載入公告失敗');
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 載入統計資料
  const loadSummary = async () => {
    try {
      const response = await fetch('/api/announcements/summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        const errorMessage = handleApiError(response, '載入統計資料失敗');
        showErrorToast(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '載入統計資料失敗');
      showErrorToast(errorMessage);
    }
  };

  // 初始載入
  useEffect(() => {
    loadAnnouncements();
    loadSummary();
  }, [activeFilter]);

  const handleToggleRead = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === id
          ? { ...announcement, isRead: !announcement.isRead }
          : announcement
      )
    );
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    setDeleteTarget({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/announcements/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // 重新載入資料
        loadAnnouncements();
        loadSummary();
        showSuccessToast('公告刪除成功');
      } else {
        // 檢查是否為權限錯誤
        if (response.status === 403) {
          const errorMessage = await extractPermissionError(
            response,
            'announcements.delete'
          );
          showPermissionError(errorMessage);
        } else {
          const errorMessage = handleApiError(response, '刪除失敗，請稍後再試');
          showErrorToast(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '刪除失敗，請稍後再試');
      showErrorToast(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/read`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        // Optimistic UI 更新
        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement.id === announcementId
              ? { ...announcement, isRead: true }
              : announcement
          )
        );

        // 記錄已標記為已讀
        setHasMarkedRead((prev) => ({
          ...prev,
          [announcementId]: true,
        }));

        // 重新載入統計資料
        loadSummary();
        showSuccessToast('已標記為已讀');
      } else {
        const errorMessage = handleApiError(response, '標記已讀失敗');
        showErrorToast(errorMessage);
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '標記已讀失敗');
      showErrorToast(errorMessage);
    }
  };

  const handleAddAnnouncement = async (data: {
    title: string;
    type: string;
    description: string;
    attachments: Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageType: 'cloud' | 'database';
      fileUrl?: string;
      cloudKey?: string;
      cloudProvider?: string;
      data?: Buffer;
    }>;
  }) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          type: data.type,
          content: data.description,
          attachments: data.attachments, // 傳遞處理後的附件
        }),
      });

      if (response.ok) {
        // 重新載入資料
        loadAnnouncements();
        loadSummary();
        setIsAddDialogOpen(false);
        showSuccessToast('公告新增成功');
      } else {
        // 檢查是否為權限錯誤
        if (response.status === 403) {
          const errorMessage = await extractPermissionError(
            response,
            'announcements.create'
          );
          showPermissionError(errorMessage);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = handleApiError(
            errorData,
            '新增公告失敗，請稍後再試'
          );
          showErrorToast(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = handleApiError(error, '新增公告失敗，請稍後再試');
      showErrorToast(errorMessage);
    }
  };

  // 移除重複的函數，使用共用 utility

  const breadcrumbs = [
    {
      label: '公告信息',
      isCurrentPage: true,
    },
  ];

  // 獲取當前用戶信息
  const currentUser = useCurrentUser();

  return (
    <>
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          breadcrumbs={breadcrumbs}
          actions={
            currentUser && (
              <div className="flex items-center gap-2">
                <UserAvatar
                  name={currentUser.name}
                  image={currentUser.image}
                  className="size-6"
                />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser.name}
                </span>
              </div>
            )
          }
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-6">
                  {/* Header Section */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                      <Megaphone className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900">
                        公告信息
                      </h1>
                      <p className="text-gray-600">查看最新的公告和重要信息</p>
                    </div>
                    <AnnouncementCreateGate>
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        新增公告
                      </Button>
                    </AnnouncementCreateGate>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                        activeFilter === 'all'
                          ? 'border-blue-300 bg-blue-50'
                          : 'hover:border-blue-200'
                      }`}
                      onClick={() => setActiveFilter('all')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            總公告數
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                        activeFilter === 'unread'
                          ? 'border-orange-300 bg-orange-50'
                          : 'hover:border-orange-200'
                      }`}
                      onClick={() => setActiveFilter('unread')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                          <Info className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            未讀公告
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.unread}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                        activeFilter === 'important'
                          ? 'border-red-300 bg-red-50'
                          : 'hover:border-red-200'
                      }`}
                      onClick={() => setActiveFilter('important')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            重要公告
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {summary.important}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Announcements Grid */}
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-500">載入中...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {announcements.map((announcement) => {
                        const IconComponent = getTypeIcon(announcement.type);
                        return (
                          <div
                            key={announcement.id}
                            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 relative cursor-pointer"
                            onClick={() => handleViewAnnouncement(announcement)}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getTypeColor(announcement.type)} text-white shadow-lg mb-3`}
                              >
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div className="w-full">
                                <div className="flex flex-col items-center gap-2 mb-2">
                                  <h3 className="text-base font-semibold text-gray-900 text-center">
                                    {announcement.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeTagColor(announcement.type)}`}
                                  >
                                    {getTypeLabel(announcement.type)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDate(announcement.publishAt)}
                                  </span>
                                </div>

                                <div className="flex justify-center">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                                      announcement.isRead
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    {announcement.isRead ? '已讀' : '未讀'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Delete Button */}
                            <AnnouncementDeleteGate>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAnnouncement(
                                    announcement.id,
                                    announcement.title
                                  );
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AnnouncementDeleteGate>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!loading && announcements.length === 0 && (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-gray-500">目前沒有公告</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Announcement Dialog */}
      <AddAnnouncementDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddAnnouncement}
      />

      {/* View Announcement Dialog */}
      <ViewAnnouncementDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        announcement={selectedAnnouncement}
        onMarkAsRead={handleMarkAsRead}
        hasMarkedRead={hasMarkedRead}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>系統提醒</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除公告「{deleteTarget?.title}」嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
