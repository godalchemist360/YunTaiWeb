/**
 * 權限相關工具函數
 * 提供權限錯誤處理和用戶友好的錯誤訊息
 */

import {
  type PermissionAction,
  getPermissionErrorMessage,
} from './permissions';

/**
 * 處理權限相關的 API 錯誤
 * @param error API 錯誤響應
 * @param action 權限動作
 * @returns 用戶友好的錯誤訊息
 */
export function handlePermissionError(
  error: any,
  action: PermissionAction
): string {
  console.error('Permission Error:', error);

  // 如果是 403 權限錯誤，返回權限錯誤訊息
  if (error?.status === 403 || error?.statusCode === 403) {
    return getPermissionErrorMessage(action);
  }

  // 如果是權限相關的錯誤訊息
  if (error?.error === '身份組無權限進行此操作') {
    return getPermissionErrorMessage(action);
  }

  // 其他錯誤使用預設處理
  if (error?.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return getPermissionErrorMessage(action);
}

/**
 * 檢查 API 響應是否為權限錯誤
 * @param response API 響應
 * @returns 是否為權限錯誤
 */
export function isPermissionError(response: Response): boolean {
  return response.status === 403;
}

/**
 * 從 API 響應中提取權限錯誤訊息
 * @param response API 響應
 * @param action 權限動作
 * @returns 錯誤訊息
 */
export async function extractPermissionError(
  response: Response,
  action: PermissionAction
): Promise<string> {
  try {
    const errorData = await response.json();
    return handlePermissionError(errorData, action);
  } catch {
    return getPermissionErrorMessage(action);
  }
}

/**
 * 顯示權限錯誤提示
 * @param message 錯誤訊息
 */
export function showPermissionError(message: string) {
  // 使用現有的錯誤提示系統
  alert(message);
}

/**
 * 權限檢查裝飾器 - 用於 API 調用
 * @param action 權限動作
 * @param apiCall API 調用函數
 * @returns 包裝後的 API 調用函數
 */
export function withPermissionCheck<T extends any[], R>(
  action: PermissionAction,
  apiCall: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await apiCall(...args);
    } catch (error: any) {
      const errorMessage = handlePermissionError(error, action);
      showPermissionError(errorMessage);
      throw new Error(errorMessage);
    }
  };
}
