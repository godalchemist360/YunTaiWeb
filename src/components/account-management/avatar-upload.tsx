'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (avatarUrl: string) => void;
  userId: number;
  disabled?: boolean;
  mode?: 'immediate' | 'deferred'; // 新增模式選擇
}

export interface AvatarUploadRef {
  uploadAvatar: () => Promise<string | null>;
}

export const AvatarUpload = forwardRef<AvatarUploadRef, AvatarUploadProps>(({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  disabled = false,
  mode = 'immediate',
}, ref) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    uploadAvatar,
  }));

  // 生成預設頭像 URL
  const getDefaultAvatarUrl = (displayName: string, size: number = 200) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=${size}&background=random&color=fff&bold=true`;
  };

  // 獲取頭像 URL（支援不同尺寸）
  const getAvatarUrl = (avatarUrl: string | undefined, displayName: string, size: number = 200) => {
    if (avatarUrl) {
      // 如果有上傳的頭像，嘗試使用對應尺寸的縮圖
      // 檢查是否已經是縮圖格式
      if (avatarUrl.includes('_50.jpg') || avatarUrl.includes('_200.jpg')) {
        // 如果已經是縮圖，直接返回
        return avatarUrl;
      }
      // 替換檔案副檔名為縮圖格式
      return avatarUrl.replace(/\.(jpg|png)$/, `_${size}.jpg`);
    }
    return getDefaultAvatarUrl(displayName, size);
  };

  // 處理檔案選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 驗證檔案類型
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('只支援 JPG 和 PNG 格式的圖片');
      return;
    }

    // 驗證檔案大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('檔案大小不能超過 5MB');
      return;
    }

    setError(null);

    // 儲存待上傳的檔案
    setPendingFile(file);

    // 建立預覽
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  // 裁剪圖片為 200x200px
  const cropImage = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error('Canvas not available'));
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 設定 canvas 尺寸
        canvas.width = 200;
        canvas.height = 200;

        // 計算裁剪區域（正方形，從中心開始）
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // 清除 canvas 並繪製裁剪後的圖片
        ctx.clearRect(0, 0, 200, 200);
        ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);

        // 轉換為 base64
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(croppedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  // 上傳頭像（內部方法）
  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // 裁剪圖片
      const croppedImageUrl = await cropImage(previewUrl);

      // 轉換 base64 為 Blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // 建立 FormData
      const formData = new FormData();
      formData.append('file', blob, `avatar_${userId}.jpg`);
      formData.append('userId', userId.toString());

      // 上傳到 API
      const uploadResponse = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '上傳失敗');
      }

      const result = await uploadResponse.json();

      // 更新頭像 URL
      onAvatarChange(result.avatarUrl);
      setPreviewUrl(null);
      setPendingFile(null);

      // 清除檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : '上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  // 公開的上傳方法（供父組件調用）
  const uploadAvatar = async (): Promise<string | null> => {
    if (!pendingFile || !previewUrl) return null;

    setIsUploading(true);
    setError(null);

    try {
      // 裁剪圖片
      const croppedImageUrl = await cropImage(previewUrl);

      // 轉換 base64 為 Blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // 建立 FormData
      const formData = new FormData();
      formData.append('file', blob, `avatar_${userId}.jpg`);
      formData.append('userId', userId.toString());

      // 上傳到 API
      const uploadResponse = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || '上傳失敗');
      }

      const result = await uploadResponse.json();

      // 清除狀態
      setPreviewUrl(null);
      setPendingFile(null);

      // 清除檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return result.avatarUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : '上傳失敗');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 取消上傳
  const handleCancel = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 刪除頭像
  const handleRemove = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      // 從資料庫移除頭像 URL
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: null }),
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      onAvatarChange('');
    } catch (error) {
      console.error('Remove error:', error);
      setError(error instanceof Error ? error.message : '刪除失敗');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 當前頭像顯示 */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={getAvatarUrl(currentAvatarUrl, 'User', 200)}
            alt="頭像"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">當前頭像</p>
          <p className="text-xs text-gray-500">
            {currentAvatarUrl ? '已設定' : '使用預設頭像'}
          </p>
        </div>
      </div>

      {/* 檔案選擇 */}
      <div className="space-y-2">
        <Label htmlFor="avatar-upload">選擇新頭像</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="avatar-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileSelect}
            ref={fileInputRef}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>選擇圖片</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          支援 JPG、PNG 格式，檔案大小不超過 5MB
        </p>
      </div>

      {/* 預覽和上傳 */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>預覽</Label>
            <div className="flex items-center space-x-4">
              <img
                src={previewUrl}
                alt="預覽"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="text-sm font-medium">新頭像預覽</p>
                <p className="text-xs text-gray-500">
                  將自動裁剪為 200x200px
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {mode === 'immediate' ? (
              <>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={disabled || isUploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? '上傳中...' : '上傳'}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={disabled || isUploading}
                >
                  取消
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={disabled || isUploading}
              >
                取消選擇
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* 隱藏的 canvas 用於圖片裁剪 */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={200}
        height={200}
      />
    </div>
  );
});

AvatarUpload.displayName = 'AvatarUpload';
