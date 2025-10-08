// 銷售支援文件類型定義

export interface SalesSupportDocument {
  id: string;
  category: string;
  item: string;
  classification: string;
  file_name: string;
  file_size: string;
  description: string | null;
  file_url: string | null;
  cloud_key: string | null;
  created_at: string;
}

// API 查詢參數
export interface SalesSupportQueryParams {
  category?: string;
  item?: string;
  page?: number;
  pageSize?: number;
}

// API 回應格式
export interface SalesSupportResponse {
  items: SalesSupportDocument[];
  total: number;
  page: number;
  pageSize: number;
}
