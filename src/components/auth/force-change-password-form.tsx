'use client';

import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ForceChangePasswordFormProps {
  account: string;
  currentPassword: string;
  onSuccess: () => void;
  className?: string;
}

export function ForceChangePasswordForm({
  account,
  currentPassword,
  onSuccess,
  className,
}: ForceChangePasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordMismatch(value && newPassword && value !== newPassword);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordMismatch(confirmPassword && value && value !== confirmPassword);
    if (newPasswordError) setNewPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError('');
    setPasswordMismatch(false);

    if (newPassword.trim() === '') {
      setNewPasswordError('請輸入新密碼');
      return;
    }

    if (newPassword === account) {
      setNewPasswordError('新密碼不得與帳號相同');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      toast.error('二次輸入密碼不符合');
      return;
    }

    setIsPending(true);

    try {
      const res = await fetch('/api/force-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      setIsPending(false);

      if (res.ok && data.ok) {
        toast.success('密碼已更新，請使用新密碼登入');
        onSuccess();
      } else {
        setNewPasswordError(data.error || '修改失敗');
      }
    } catch (err) {
      setIsPending(false);
      setNewPasswordError('伺服器錯誤');
      console.error('force-change-password error:', err);
    }
  };

  return (
    <AuthCard
      headerLabel="修改密碼"
      bottomButtonLabel=""
      bottomButtonHref=""
      className={className}
    >
      <p className="text-sm text-gray-600 mb-6">
        基於安全考量，您的帳號與密碼相同，請先修改密碼後再登入。
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword" className="text-gray-700 font-medium">
              新密碼
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="請輸入新密碼"
                disabled={isPending}
                className={`bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg pr-10 ${
                  newPasswordError ? 'border-red-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50 rounded-r-lg"
                onClick={() => setShowNewPassword((p) => !p)}
                disabled={isPending}
              >
                {showNewPassword ? (
                  <EyeOffIcon className="size-4 text-gray-500" />
                ) : (
                  <EyeIcon className="size-4 text-gray-500" />
                )}
                <span className="sr-only">
                  {showNewPassword ? '隱藏密碼' : '顯示密碼'}
                </span>
              </Button>
            </div>
            {newPasswordError && (
              <p className="text-sm text-red-500">{newPasswordError}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="confirmPassword"
              className="text-gray-700 font-medium"
            >
              確認密碼
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="請再次輸入新密碼"
                disabled={isPending}
                className={`bg-white border-gray-300 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg pr-10 ${
                  passwordMismatch ? 'border-red-500' : ''
                }`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50 rounded-r-lg"
                onClick={() => setShowConfirmPassword((p) => !p)}
                disabled={isPending}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="size-4 text-gray-500" />
                ) : (
                  <EyeIcon className="size-4 text-gray-500" />
                )}
                <span className="sr-only">
                  {showConfirmPassword ? '隱藏密碼' : '顯示密碼'}
                </span>
              </Button>
            </div>
            {passwordMismatch && (
              <p className="text-sm text-red-500">密碼不一致</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2Icon className="size-4 animate-spin" />}
          <span>確定修改</span>
        </Button>
      </form>
    </AuthCard>
  );
}
