/**
 * 權限檢查 Hook
 * 提供當前用戶的權限檢查功能
 */

import {
  type PermissionAction,
  type UserRole,
  canCreateAnnouncement,
  canCreateCustomerTracking,
  canDeleteAnnouncement,
  canDeleteCustomerTracking,
  canEditAnnouncement,
  canEditCustomerTracking,
  canViewAnnouncement,
  canViewCustomerTracking,
  hasPermission,
} from '@/lib/permissions';
import { useAppUser } from './use-app-user';

export function usePermissions() {
  const { user, isLoading, error } = useAppUser();
  const userRole = user?.role as UserRole | undefined;

  return {
    // 用戶資訊
    user,
    userRole,
    isLoading,
    error,

    // 通用權限檢查
    hasPermission: (action: PermissionAction) =>
      hasPermission(userRole, action),

    // 公告相關權限
    canCreateAnnouncement: () => canCreateAnnouncement(userRole),
    canDeleteAnnouncement: () => canDeleteAnnouncement(userRole),
    canEditAnnouncement: () => canEditAnnouncement(userRole),
    canViewAnnouncement: () => canViewAnnouncement(userRole),

    // 用戶相關權限（預留）
    canCreateUser: () => hasPermission(userRole, 'users.create'),
    canDeleteUser: () => hasPermission(userRole, 'users.delete'),
    canEditUser: () => hasPermission(userRole, 'users.edit'),
    canViewUser: () => hasPermission(userRole, 'users.view'),

    // 客戶追蹤相關權限
    canCreateCustomerTracking: () => canCreateCustomerTracking(userRole),
    canDeleteCustomerTracking: () => canDeleteCustomerTracking(userRole),
    canEditCustomerTracking: () => canEditCustomerTracking(userRole),
    canViewCustomerTracking: () => canViewCustomerTracking(userRole),

    // 角色檢查
    isAdmin: () => userRole === 'admin',
    isManagement: () => userRole === 'management',
    isSales: () => userRole === 'sales',

    // 登入狀態檢查
    isLoggedIn: () => user !== null && user !== undefined,
  };
}
