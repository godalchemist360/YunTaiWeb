/**
 * 權限控制組件
 * 根據用戶權限顯示或隱藏子組件
 */

import { usePermissions } from '@/hooks/use-permissions';
import { type PermissionAction } from '@/lib/permissions';
import { ReactNode } from 'react';

interface PermissionGateProps {
  /** 需要的權限動作 */
  permission: PermissionAction;
  /** 子組件 */
  children: ReactNode;
  /** 無權限時顯示的內容（可選） */
  fallback?: ReactNode;
  /** 是否顯示無權限提示（預設 false） */
  showFallback?: boolean;
}

/**
 * 權限控制組件
 * 只有當用戶有指定權限時才顯示子組件
 */
export function PermissionGate({ 
  permission, 
  children, 
  fallback = null, 
  showFallback = false 
}: PermissionGateProps) {
  const { hasPermission } = usePermissions();
  
  const hasAccess = hasPermission(permission);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  if (showFallback) {
    return <>{fallback}</>;
  }
  
  return null;
}

/**
 * 公告創建權限組件
 */
export function AnnouncementCreateGate({ children, fallback, showFallback }: Omit<PermissionGateProps, 'permission'>) {
  return (
    <PermissionGate 
      permission="announcements.create" 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * 公告刪除權限組件
 */
export function AnnouncementDeleteGate({ children, fallback, showFallback }: Omit<PermissionGateProps, 'permission'>) {
  return (
    <PermissionGate 
      permission="announcements.delete" 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * 公告編輯權限組件
 */
export function AnnouncementEditGate({ children, fallback, showFallback }: Omit<PermissionGateProps, 'permission'>) {
  return (
    <PermissionGate 
      permission="announcements.edit" 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGate>
  );
}

/**
 * 公告查看權限組件
 */
export function AnnouncementViewGate({ children, fallback, showFallback }: Omit<PermissionGateProps, 'permission'>) {
  return (
    <PermissionGate 
      permission="announcements.view" 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGate>
  );
}
