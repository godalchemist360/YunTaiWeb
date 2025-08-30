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
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: {
    id: number;
    display_name: string;
    role: string;
  };
  onSubmit?: (formData: {
    id: number;
    display_name: string;
    role: string;
    password?: string;
  }) => Promise<void>;
}

export function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
}: EditAccountDialogProps) {
  const [formData, setFormData] = useState({
    display_name: '',
    role: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 當 account 改變時，重置表單
  useEffect(() => {
    if (account) {
      setFormData({
        display_name: account.display_name,
        role: account.role,
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    }
  }, [account]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 清除對應欄位的錯誤
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 驗證顯示名稱
    if (!formData.display_name.trim()) {
      newErrors.display_name = '使用者姓名為必填欄位';
    }

    // 驗證角色
    if (!formData.role) {
      newErrors.role = '請選擇帳號層級';
    }

    // 驗證密碼
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.newPassword) {
        newErrors.newPassword = '請輸入新密碼';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = '密碼長度至少6位';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '請確認密碼';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = '密碼不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!account || !validateForm()) {
      return;
    }

    try {
      const payload: any = {
        display_name: formData.display_name.trim(),
        role: formData.role,
      };

      // 如果有輸入新密碼且驗證通過，則加入密碼欄位
      if (formData.newPassword && formData.newPassword === formData.confirmPassword) {
        payload.password = formData.newPassword;
      }

      if (onSubmit) {
        await onSubmit({
          id: account.id,
          ...payload,
        });
      }

      // 重置表單
      setFormData({
        display_name: '',
        role: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      // 關閉對話框
      onOpenChange(false);
    } catch (error: any) {
      console.error('編輯帳號失敗:', error);

      // 如果是密碼相關錯誤，清空密碼欄位
      if (error.message?.includes('密碼') || error.message?.includes('password')) {
        setFormData((prev) => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));
        setErrors({
          newPassword: error.message || '密碼設定失敗',
        });
      } else {
        alert(error.message || '編輯帳號失敗');
      }
    }
  };

  const handleCancel = () => {
    // 重置表單
    setFormData({
      display_name: '',
      role: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);

    // 關閉對話框
    onOpenChange(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理員';
      case 'management':
        return '管理層';
      case 'sales':
        return '業務員';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯帳號</DialogTitle>
          <DialogDescription>
            修改帳號資訊，密碼欄位為選填，留空則不變更密碼
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">使用者姓名 *</Label>
            <Input
              id="displayName"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="請輸入使用者姓名"
              className={errors.display_name ? 'border-red-500' : ''}
            />
            {errors.display_name && (
              <p className="text-sm text-red-500">{errors.display_name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">帳號層級 *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="請選擇帳號層級" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="management">管理層</SelectItem>
                <SelectItem value="sales">業務員</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">新密碼（選填）</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="請輸入新密碼"
                className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">確認密碼</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="請再次輸入新密碼"
                className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleSubmit} type="button">
            確定修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
