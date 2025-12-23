'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUser } from '@/lib/usersClient';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  userId,
}: ChangePasswordDialogProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState('');

  // 即時驗證密碼是否一致
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && newPassword && value !== newPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const handleOldPasswordChange = (value: string) => {
    setOldPassword(value);
    // 清除舊密碼錯誤
    if (oldPasswordError) {
      setOldPasswordError('');
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (confirmPassword && value && value !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  const handleSubmit = async () => {
    // 清除之前的錯誤
    setOldPasswordError('');
    setPasswordMismatch(false);

    // 驗證舊密碼是否必填
    if (!oldPassword.trim()) {
      setOldPasswordError('請輸入舊密碼');
      return;
    }

    // 驗證新密碼是否必填
    if (!newPassword.trim()) {
      toast.error('請輸入新密碼');
      return;
    }

    // 驗證兩個密碼是否一致
    if (newPassword !== confirmPassword) {
      toast.error('二次輸入密碼不符合');
      return;
    }

    setIsLoading(true);

    try {
      await updateUser(userId, { 
        password: newPassword,
        oldPassword: oldPassword 
      });
      toast.success('密碼修改成功');
      
      // 重置表單
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMismatch(false);
      setOldPasswordError('');
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      // 關閉對話框
      onOpenChange(false);
    } catch (error: any) {
      // 檢查是否是舊密碼錯誤
      if (error.message?.includes('舊密碼錯誤')) {
        setOldPasswordError('舊密碼錯誤');
        setOldPassword('');
        // 舊密碼錯誤不需要顯示 toast，只在表單內顯示錯誤即可
      } else {
        console.error('修改密碼失敗:', error);
        toast.error('修改失敗');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // 重置表單
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMismatch(false);
    setOldPasswordError('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    // 關閉對話框
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改密碼</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">舊密碼</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => handleOldPasswordChange(e.target.value)}
                placeholder="請輸入舊密碼"
                className={`pr-10 ${oldPasswordError ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showOldPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {oldPasswordError && (
              <p className="text-sm text-red-500">{oldPasswordError}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">新密碼</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="請輸入新密碼"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">確認密碼</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="請再次輸入新密碼"
                className={`pr-10 ${passwordMismatch ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-sm text-red-500">密碼不一致</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? '修改中...' : '確定修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

