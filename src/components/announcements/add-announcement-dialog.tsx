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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  getFileSizeText,
  handleApiError,
  showErrorToast,
  showSuccessToast,
} from '@/lib/announcement-utils';
import { uploadFileFromBrowser } from '@/storage/client';
import { CheckCircle, Paperclip, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
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
  }) => void;
}

export function AddAnnouncementDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddAnnouncementDialogProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState<
    Array<{
      fileName: string;
      fileSize: number;
      mimeType: string;
      storageType: 'cloud' | 'database';
      fileUrl?: string;
      cloudKey?: string;
      cloudProvider?: string;
      data?: Buffer;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !type || !description.trim()) {
      showErrorToast('請填寫所有必填欄位');
      return;
    }

    try {
      setIsUploading(true);

      // 處理附件上傳
      const processedAttachments: any[] = [];

      for (const file of attachments) {
        try {
          // 所有檔案都上傳到雲端儲存
          console.log(`正在上傳檔案 ${file.name} 到雲端...`);
          const result = await uploadFileFromBrowser(file, 'announcements');

          processedAttachments.push({
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            storageType: 'cloud' as const,
            fileUrl: result.url,
            cloudKey: result.key,
            cloudProvider: 's3',
          });

          console.log(`檔案 ${file.name} 上傳成功`);
        } catch (error) {
          const errorMessage = handleApiError(
            error,
            `檔案 ${file.name} 處理失敗，請稍後再試`
          );
          showErrorToast(errorMessage);
          return;
        }
      }

      // 提交表單
      onSubmit({
        title: title.trim(),
        type,
        description: description.trim(),
        attachments: processedAttachments,
      });

      // 重置表單
      setTitle('');
      setType('');
      setDescription('');
      setAttachments([]);
      setUploadingAttachments([]);
      onOpenChange(false);
      showSuccessToast('公告新增成功');
    } catch (error) {
      const errorMessage = handleApiError(error, '提交失敗，請稍後再試');
      showErrorToast(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // 驗證檔案類型和大小
    const validFiles = files.filter((file) => {
      const maxSize = file.type.startsWith('audio/')
        ? 100 * 1024 * 1024
        : file.type.startsWith('video/')
          ? 500 * 1024 * 1024
          : file.type.startsWith('image/')
            ? 10 * 1024 * 1024
            : 50 * 1024 * 1024;

      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
        showErrorToast(`檔案 ${file.name} 超過大小限制：${maxSizeMB}MB`);
        return false;
      }

      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 移除重複的函數，使用共用 utility

  const getStorageTypeText = (file: File) => {
    // 所有檔案都使用雲端儲存
    return '雲端儲存';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>新增公告</DialogTitle>
          <DialogDescription>
            填寫公告資訊，所有標記 * 的欄位為必填項目
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 標題 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              標題 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入公告標題"
              className="w-full"
            />
          </div>

          {/* 公告類型 */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              公告類型 <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="請選擇公告類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">一般</SelectItem>
                <SelectItem value="important">重要</SelectItem>
                <SelectItem value="resource">資源</SelectItem>
                <SelectItem value="training">培訓</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 內文 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              內文 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請輸入公告內容"
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* 新增附件 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">新增附件</Label>
            <div className="space-y-3">
              {/* 檔案上傳按鈕 */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  選擇檔案
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">
                  支援圖片、音檔、影片、文件等格式
                </span>
              </div>

              {/* 已選擇的檔案列表 */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">已選擇的檔案：</Label>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{getFileSizeText(file.size)}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {getStorageTypeText(file)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 按鈕 */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  處理中...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  新增公告
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
