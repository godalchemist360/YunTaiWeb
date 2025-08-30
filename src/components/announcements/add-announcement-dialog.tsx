'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Paperclip, X } from 'lucide-react';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    type: string;
    description: string;
    attachments: File[];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !type || !description.trim()) {
      alert('請填寫所有必填欄位');
      return;
    }

    onSubmit({
      title: title.trim(),
      type,
      description: description.trim(),
      attachments,
    });

    // 重置表單
    setTitle('');
    setType('');
    setDescription('');
    setAttachments([]);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
                  onClick={() => document.getElementById('file-upload')?.click()}
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
                  支援 PDF、Word、Excel、圖片等格式
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
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
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
            >
              取消
            </Button>
            <Button type="submit">
              新增公告
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
