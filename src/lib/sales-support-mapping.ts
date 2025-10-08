/**
 * 銷售支援頁面映射配置
 * 用於將頁面路由對應到資料庫中的 category 值
 */

export const SALES_SUPPORT_MAPPING = {
  // 主分類映射（左側導航）
  'customer-overview': 'customer-overview',
  'real-estate': 'real-estate',
  'insurance': 'insurance',
  'marketing': 'marketing',
  'fund-recommendation': 'fund-recommendation',
  'lease-management': 'lease-management',
  'accounting-tax': 'accounting-tax',
  'interior-decoration': 'interior-decoration',
  'legal-consultation': 'legal-consultation',
} as const;

// 子分類映射（客戶服務頁面的四個卡片）
export const CUSTOMER_OVERVIEW_ITEMS = {
  'contract': '契約文件',
  'strategy': '配置策略',
  'analysis': '資產分析',
  'bank': '銀行窗口',
} as const;

export type SalesSupportCategory = keyof typeof SALES_SUPPORT_MAPPING;
export type CustomerOverviewItem = keyof typeof CUSTOMER_OVERVIEW_ITEMS;
