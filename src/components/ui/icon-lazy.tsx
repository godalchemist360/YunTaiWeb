'use client';

import dynamic from 'next/dynamic';
import { IconSkeleton } from '@/components/ui/loading-skeletons';

/**
 * 懶載入的圖標組件
 * 將 lucide-react 圖標改為動態載入
 */

// 創建懶載入圖標的工廠函數
function createLazyIcon(iconName: string) {
  return dynamic(() => import('lucide-react').then(mod => ({
    default: (mod as any)[iconName] || (() => <div>Icon not found</div>)
  })), {
    loading: () => <IconSkeleton />,
    ssr: false,
  });
}

// 常用的懶載入圖標
export const HomeIcon = createLazyIcon('Home');
export const UserIcon = createLazyIcon('User');
export const SettingsIcon = createLazyIcon('Settings');
export const SearchIcon = createLazyIcon('Search');
export const MenuIcon = createLazyIcon('Menu');
export const CloseIcon = createLazyIcon('X');
export const ChevronDownIcon = createLazyIcon('ChevronDown');
export const ChevronUpIcon = createLazyIcon('ChevronUp');
export const ChevronLeftIcon = createLazyIcon('ChevronLeft');
export const ChevronRightIcon = createLazyIcon('ChevronRight');
export const PlusIcon = createLazyIcon('Plus');
export const MinusIcon = createLazyIcon('Minus');
export const EditIcon = createLazyIcon('Edit');
export const DeleteIcon = createLazyIcon('Trash2');
export const SaveIcon = createLazyIcon('Save');
export const DownloadIcon = createLazyIcon('Download');
export const UploadIcon = createLazyIcon('Upload');
export const EyeIcon = createLazyIcon('Eye');
export const EyeOffIcon = createLazyIcon('EyeOff');
export const LockIcon = createLazyIcon('Lock');
export const UnlockIcon = createLazyIcon('Unlock');
export const MailIcon = createLazyIcon('Mail');
export const PhoneIcon = createLazyIcon('Phone');
export const CalendarIcon = createLazyIcon('Calendar');
export const ClockIcon = createLazyIcon('Clock');
export const StarIcon = createLazyIcon('Star');
export const HeartIcon = createLazyIcon('Heart');
export const ShareIcon = createLazyIcon('Share');
export const CopyIcon = createLazyIcon('Copy');
export const CheckIcon = createLazyIcon('Check');
export const AlertIcon = createLazyIcon('AlertCircle');
export const InfoIcon = createLazyIcon('Info');
export const WarningIcon = createLazyIcon('AlertTriangle');
export const ErrorIcon = createLazyIcon('XCircle');
export const SuccessIcon = createLazyIcon('CheckCircle');

// 動態圖標組件 - 用於需要動態圖標名稱的情況
export function DynamicIcon({ name, ...props }: { name: string; [key: string]: any }) {
  const LazyIcon = createLazyIcon(name);
  return <LazyIcon {...props} />;
}
