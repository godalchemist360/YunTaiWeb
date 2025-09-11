import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Info,
  FileText,
  Play,
  Image,
  Video,
  Music,
  File,
  FileImage,
  FileVideo,
  FileAudio,
} from 'lucide-react';

// 公告類型相關函數
export const getTypeLabel = (type: string): string => {
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

export const getTypeIcon = (type: string) => {
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

export const getTypeColor = (type: string): string => {
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

export const getTypeTagColor = (type: string): string => {
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
      return 'bg-gray-100 text-gray-800';
  }
};

// 檔案相關函數
export const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return FileText;

  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('application/pdf')) return FileText;
  if (mimeType.startsWith('application/')) return File;

  return FileText;
};

export const getFileSizeText = (size?: number): string => {
  if (!size) return '';
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
};

export const getStorageTypeText = (storageType?: string): string => {
  return '雲端儲存';
};

export const getStorageTypeColor = (storageType?: string): string => {
  return 'bg-green-100 text-green-700';
};

// 日期格式化
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 錯誤處理
export const handleApiError = (error: any, defaultMessage: string = '操作失敗'): string => {
  console.error('API Error:', error);

  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

export const showErrorToast = (message: string) => {
  // 這裡可以整合 toast 通知系統
  alert(message);
};

export const showSuccessToast = (message: string) => {
  // 這裡可以整合 toast 通知系統
  console.log('Success:', message);
};
