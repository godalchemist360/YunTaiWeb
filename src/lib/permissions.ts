/**
 * 權限配置和檢查函數
 * 定義系統中所有角色的權限規則
 */

// 系統角色定義
export type UserRole = 'admin' | 'management' | 'sales';

// 權限動作定義
export type PermissionAction =
  | 'announcements.create'
  | 'announcements.delete'
  | 'announcements.edit'
  | 'announcements.view'
  | 'users.create'
  | 'users.delete'
  | 'users.edit'
  | 'users.view'
  | 'customer-tracking.create'
  | 'customer-tracking.edit'
  | 'customer-tracking.view'
  | 'customer-tracking.delete';

// 權限配置：角色 -> 權限動作映射
export const PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: [
    'announcements.create',
    'announcements.delete',
    'announcements.edit',
    'announcements.view',
    'users.create',
    'users.delete',
    'users.edit',
    'users.view',
    'customer-tracking.create',
    'customer-tracking.edit',
    'customer-tracking.view',
    'customer-tracking.delete',
  ],
  management: [
    'announcements.create',
    'announcements.delete',
    'announcements.edit',
    'announcements.view',
    'users.view', // 管理層可以查看用戶，但可能不能創建/刪除
    'customer-tracking.create',
    'customer-tracking.edit',
    'customer-tracking.view',
    'customer-tracking.delete',
  ],
  sales: [
    'announcements.view',
    // sales 角色不能創建或刪除公告
    'customer-tracking.create',
    'customer-tracking.edit',
    'customer-tracking.view',
    // sales 不能刪除客戶追蹤記錄
  ],
};

/**
 * 檢查用戶是否有特定權限
 * @param userRole 用戶角色
 * @param action 權限動作
 * @returns 是否有權限
 */
export function hasPermission(userRole: UserRole | undefined, action: PermissionAction): boolean {
  if (!userRole) {
    return false;
  }

  const rolePermissions = PERMISSIONS[userRole];
  return rolePermissions.includes(action);
}

/**
 * 檢查用戶是否可以創建公告
 * @param userRole 用戶角色
 * @returns 是否可以創建公告
 */
export function canCreateAnnouncement(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'announcements.create');
}

/**
 * 檢查用戶是否可以刪除公告
 * @param userRole 用戶角色
 * @returns 是否可以刪除公告
 */
export function canDeleteAnnouncement(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'announcements.delete');
}

/**
 * 檢查用戶是否可以編輯公告
 * @param userRole 用戶角色
 * @returns 是否可以編輯公告
 */
export function canEditAnnouncement(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'announcements.edit');
}

/**
 * 檢查用戶是否可以查看公告
 * @param userRole 用戶角色
 * @returns 是否可以查看公告
 */
export function canViewAnnouncement(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'announcements.view');
}

/**
 * 檢查用戶是否可以創建客戶追蹤記錄
 * @param userRole 用戶角色
 * @returns 是否可以創建客戶追蹤記錄
 */
export function canCreateCustomerTracking(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'customer-tracking.create');
}

/**
 * 檢查用戶是否可以刪除客戶追蹤記錄
 * @param userRole 用戶角色
 * @returns 是否可以刪除客戶追蹤記錄
 */
export function canDeleteCustomerTracking(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'customer-tracking.delete');
}

/**
 * 檢查用戶是否可以編輯客戶追蹤記錄
 * @param userRole 用戶角色
 * @returns 是否可以編輯客戶追蹤記錄
 */
export function canEditCustomerTracking(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'customer-tracking.edit');
}

/**
 * 檢查用戶是否可以查看客戶追蹤記錄
 * @param userRole 用戶角色
 * @returns 是否可以查看客戶追蹤記錄
 */
export function canViewCustomerTracking(userRole: UserRole | undefined): boolean {
  return hasPermission(userRole, 'customer-tracking.view');
}

/**
 * 獲取權限錯誤訊息
 * @param action 權限動作
 * @returns 錯誤訊息
 */
export function getPermissionErrorMessage(action: PermissionAction): string {
  const actionMessages: Record<PermissionAction, string> = {
    'announcements.create': '身份組無權限進行此操作',
    'announcements.delete': '身份組無權限進行此操作',
    'announcements.edit': '身份組無權限進行此操作',
    'announcements.view': '身份組無權限進行此操作',
    'users.create': '身份組無權限進行此操作',
    'users.delete': '身份組無權限進行此操作',
    'users.edit': '身份組無權限進行此操作',
    'users.view': '身份組無權限進行此操作',
    'customer-tracking.create': '身份組無權限進行此操作',
    'customer-tracking.delete': '身份組無權限進行此操作',
    'customer-tracking.edit': '身份組無權限進行此操作',
    'customer-tracking.view': '身份組無權限進行此操作',
  };

  return actionMessages[action] || '身份組無權限進行此操作';
}

/**
 * 獲取角色顯示名稱
 * @param role 角色
 * @returns 顯示名稱
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: '管理員',
    management: '管理層',
    sales: '業務員',
  };

  return roleNames[role] || role;
}
