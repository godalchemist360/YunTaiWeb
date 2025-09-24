'use client';

import { AvatarUpload, type AvatarUploadRef } from '@/components/account-management/avatar-upload';
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
import { useRef, useState } from 'react';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (formData: {
    displayName: string;
    username: string;
    password: string;
    level: string;
    avatarUrl?: string;
  }) => Promise<void>;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddAccountDialogProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    level: '',
    avatarUrl: '',
  });
  const avatarUploadRef = useRef<AvatarUploadRef>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // 基本驗證
    if (
      !formData.displayName ||
      !formData.username ||
      !formData.password ||
      !formData.level
    ) {
      alert('請填寫所有必填欄位');
      return;
    }

    try {
      // 先上傳頭像（如果有選擇）
      let avatarUrl = formData.avatarUrl;
      if (avatarUploadRef.current) {
        const uploadedAvatarUrl = await avatarUploadRef.current.uploadAvatar();
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl;
        }
      }

      if (onSubmit) {
        await onSubmit({
          ...formData,
          avatarUrl,
        });
      }

      // 重置表單
      setFormData({
        displayName: '',
        username: '',
        password: '',
        level: '',
        avatarUrl: '',
      });

      // 關閉對話框
      onOpenChange(false);
    } catch (error) {
      console.error('新增帳號失敗:', error);
      alert('新增帳號失敗');
    }
  };

  const handleCancel = () => {
    // 重置表單
    setFormData({
      displayName: '',
      username: '',
      password: '',
      level: '',
      avatarUrl: '',
    });

    // 關閉對話框
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增帳號</DialogTitle>
          <DialogDescription>請填寫新帳號的基本資訊</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">使用者姓名</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="請輸入使用者姓名"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">帳號</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="請輸入帳號"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="請輸入密碼"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="level">帳號層級</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleInputChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇帳號層級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">業務員</SelectItem>
                <SelectItem value="management">管理層</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 頭像上傳 */}
          <div className="grid gap-2">
            <Label>頭像（選填）</Label>
            <AvatarUpload
              ref={avatarUploadRef}
              currentAvatarUrl={formData.avatarUrl}
              onAvatarChange={(avatarUrl) => setFormData(prev => ({ ...prev, avatarUrl }))}
              userId={0} // 新增用戶時使用 0，實際會在後端處理
              mode="deferred" // 使用延遲上傳模式
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit} type="button">
            確定新增
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
