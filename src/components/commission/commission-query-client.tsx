'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Trash2, X, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalesUserSelect } from '@/components/ui/sales-user-select';
import { ToastManager } from '@/components/ui/toast';
import {
  CommissionCreateGate,
  CommissionEditGate,
  CommissionDeleteGate,
} from '@/components/permission-gate';
import {
  extractPermissionError,
  showPermissionError,
} from '@/lib/permission-utils';

interface CommissionData {
  id: string;
  salesUserId: number;
  salesName: string;
  customerName: string;
  productType: string;
  contractDate: string;
  contractAmount: number;
  commissionAmount: number;
  createdAt: string;
}

interface CommissionResponse {
  success: boolean;
  data: {
    items: CommissionData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export default function CommissionQueryClient() {
  const [data, setData] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommissionData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [kpiData, setKpiData] = useState({
    monthRevenue: 0,
    monthCommission: 0,
    ytdRevenue: 0,
  });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'success' | 'error';
    title: string;
    description?: string;
  }>>([]);
  const [formData, setFormData] = useState({
    salesperson: '',
    customerName: '',
    productType: '',
    contractDate: '',
    contractAmount: '',
    commissionAmount: ''
  });

  // 格式化金額
  const formatCurrency = (amount: number): string => {
    return `NT$${amount.toLocaleString('zh-TW')}`;
  };

  // 格式化業務員顯示（ID + 姓名）
  const formatSalesName = (userId: number, name: string): string => {
    const paddedId = userId.toString().padStart(6, '0');
    return `${paddedId} ${name}`;
  };

  // 格式化日期（只顯示年月日）
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 載入 KPI 資料
  const loadKpiData = useCallback(async () => {
    setKpiLoading(true);
    try {
      const response = await fetch('/api/commissions/kpis-simple');
      const result = await response.json();

      if (result.success && result.data) {
        setKpiData(result.data);
      } else {
        console.error('載入 KPI 資料失敗');
        setKpiData({
          monthRevenue: 0,
          monthCommission: 0,
          ytdRevenue: 0,
        });
      }
    } catch (error) {
      console.error('載入 KPI 資料失敗:', error);
      setKpiData({
        monthRevenue: 0,
        monthCommission: 0,
        ytdRevenue: 0,
      });
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // 載入資料
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        q: search,
      });

      const response = await fetch(`/api/commissions?${params}`);
      const result: CommissionResponse = await response.json();

      if (result.success) {
        setData(result.data.items);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
      } else {
        console.error('載入傭金資料失敗');
        setData([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('載入傭金資料失敗:', error);
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  // 初始載入
  useEffect(() => {
    loadKpiData();
    loadData();
  }, [loadKpiData, loadData]);

  // 搜尋處理
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // 重置到第一頁
  };

  // 分頁處理
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setPage(1); // 重置到第一頁
  };

  // 處理表單輸入
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 處理數值輸入（只允許數字）
  const handleNumberInput = (field: string, value: string) => {
    // 只允許數字和小數點
    const numericValue = value.replace(/[^\d.]/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // 重置表單
  const resetForm = () => {
    setFormData({
      salesperson: '',
      customerName: '',
      productType: '',
      contractDate: '',
      contractAmount: '',
      commissionAmount: ''
    });
  };

  // 顯示 Toast 通知
  const showToast = (type: 'success' | 'error', title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, description }]);
  };

  // 移除 Toast 通知
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 處理編輯記錄
  const handleEditClick = (item: CommissionData) => {
    setEditingItem(item);
    setFormData({
      salesperson: item.salesUserId.toString(),
      customerName: item.customerName,
      productType: item.productType,
      contractDate: item.contractDate,
      contractAmount: item.contractAmount.toString(),
      commissionAmount: item.commissionAmount.toString()
    });
    setIsEditDialogOpen(true);
  };

  // 處理刪除記錄
  const handleDeleteClick = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/commissions/${deleteItemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', '刪除成功', '傭金記錄已成功刪除');
        setIsDeleteDialogOpen(false);
        setDeleteItemId(null);
        loadData(); // 重新載入資料
      } else {
        // 檢查是否為權限錯誤
        if (response.status === 403) {
          const errorMessage = await extractPermissionError(
            response,
            'commission.delete'
          );
          showPermissionError(errorMessage);
          return;
        }
        showToast('error', '刪除失敗', result.error || '請稍後再試');
      }
    } catch (error) {
      console.error('Error deleting commission:', error);
      showToast('error', '刪除失敗', '網路連線錯誤，請稍後再試');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteItemId(null);
  };

  // 處理修改記錄
  const handleUpdateRecord = async () => {
    if (!editingItem) return;

    // 前端驗證
    if (!formData.salesperson || !formData.customerName || !formData.productType ||
        !formData.contractDate || !formData.contractAmount || !formData.commissionAmount) {
      showToast('error', '修改失敗', '請填寫所有必填欄位');
      return;
    }

    // 驗證金額格式
    const contractAmount = Number(formData.contractAmount);
    const commissionAmount = Number(formData.commissionAmount);

    if (isNaN(contractAmount) || isNaN(commissionAmount)) {
      showToast('error', '修改失敗', '金額格式不正確');
      return;
    }

    if (contractAmount < 0 || commissionAmount < 0) {
      showToast('error', '修改失敗', '金額不能為負數');
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/commissions/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_user_id: Number(formData.salesperson),
          customer_name: formData.customerName,
          product_type: formData.productType,
          contract_date: formData.contractDate,
          contract_amount: contractAmount,
          commission_amount: commissionAmount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', '修改成功', '傭金記錄已成功修改');
        setIsEditDialogOpen(false);
        setEditingItem(null);
        resetForm();
        loadData(); // 重新載入資料
      } else {
        // 檢查是否為權限錯誤
        if (response.status === 403) {
          const errorMessage = await extractPermissionError(
            response,
            'commission.edit'
          );
          showPermissionError(errorMessage);
          return;
        }
        showToast('error', '修改失敗', result.error || '請稍後再試');
      }
    } catch (error) {
      console.error('Error updating commission:', error);
      showToast('error', '修改失敗', '網路連線錯誤，請稍後再試');
    } finally {
      setIsUpdating(false);
    }
  };

  // 處理新增記錄
  const handleAddRecord = async () => {
    // 前端驗證
    if (!formData.salesperson || !formData.customerName || !formData.productType ||
        !formData.contractDate || !formData.contractAmount || !formData.commissionAmount) {
      showToast('error', '新增失敗', '請填寫所有必填欄位');
      return;
    }

    // 驗證金額格式
    const contractAmount = Number(formData.contractAmount);
    const commissionAmount = Number(formData.commissionAmount);

    if (isNaN(contractAmount) || isNaN(commissionAmount)) {
      showToast('error', '新增失敗', '金額格式不正確');
      return;
    }

    if (contractAmount < 0 || commissionAmount < 0) {
      showToast('error', '新增失敗', '金額不能為負數');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales_user_id: Number(formData.salesperson),
          customer_name: formData.customerName,
          product_type: formData.productType,
          contract_date: formData.contractDate,
          contract_amount: contractAmount,
          commission_amount: commissionAmount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('success', '新增成功', '傭金記錄已成功新增');
        setIsAddDialogOpen(false);
        resetForm();
        loadData(); // 重新載入資料
      } else {
        // 檢查是否為權限錯誤
        if (response.status === 403) {
          const errorMessage = await extractPermissionError(
            response,
            'commission.create'
          );
          showPermissionError(errorMessage);
          return;
        }
        showToast('error', '新增失敗', result.error || '請稍後再試');
      }
    } catch (error) {
      console.error('Error adding commission:', error);
      showToast('error', '新增失敗', '網路連線錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* 統計卡片區域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 本月業績 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">本月業績</p>
                {kpiLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
                    <span className="text-sm text-muted-foreground">載入中...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(kpiData.monthRevenue)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">¥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本月傭金 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">本月傭金</p>
                {kpiLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    <span className="text-sm text-muted-foreground">載入中...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(kpiData.monthCommission)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">$</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 年度累積業績 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">年度累積業績</p>
                {kpiLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                    <span className="text-sm text-muted-foreground">載入中...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(kpiData.ytdRevenue)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋業務員ID、姓名或客戶名稱..."
              className="pl-8"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <CommissionCreateGate>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新增紀錄
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新增傭金記錄</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 業務員 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="salesperson" className="w-24 text-center justify-center">
                  業務員
                </Label>
                <SalesUserSelect
                  value={formData.salesperson}
                  onChange={(value) => handleInputChange('salesperson', value)}
                  placeholder="選擇業務員"
                  className="flex-1"
                />
              </div>

              {/* 客戶名稱 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="customerName" className="w-24 text-center justify-center">
                  客戶名稱
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="flex-1"
                  placeholder="輸入客戶名稱"
                />
              </div>

              {/* 產品類型 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="productType" className="w-24 text-center justify-center">
                  產品類型
                </Label>
                <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="選擇產品類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="房地產">房地產</SelectItem>
                    <SelectItem value="保險">保險</SelectItem>
                    <SelectItem value="諮詢">諮詢</SelectItem>
                    <SelectItem value="顧問費">顧問費</SelectItem>
                    <SelectItem value="基金">基金</SelectItem>
                    <SelectItem value="行銷">行銷</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 成交日期 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="contractDate" className="w-24 text-center justify-center">
                  成交日期
                </Label>
                <input
                  id="contractDate"
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) => handleInputChange('contractDate', e.target.value)}
                  className="flex-1 h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ textAlign: 'center' }}
                />
              </div>

              {/* 業績 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="contractAmount" className="w-24 text-center justify-center">
                  業績
                </Label>
                <Input
                  id="contractAmount"
                  value={formData.contractAmount}
                  onChange={(e) => handleNumberInput('contractAmount', e.target.value)}
                  className="flex-1"
                  placeholder="輸入業績金額"
                />
              </div>

              {/* 實拿金額 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="commissionAmount" className="w-24 text-center justify-center">
                  實拿金額
                </Label>
                <Input
                  id="commissionAmount"
                  value={formData.commissionAmount}
                  onChange={(e) => handleNumberInput('commissionAmount', e.target.value)}
                  className="flex-1"
                  placeholder="輸入實拿金額"
                />
              </div>
            </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddRecord}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        新增中...
                      </>
                    ) : (
                      '新增'
                    )}
                  </Button>
                </div>
          </DialogContent>
          </Dialog>
        </CommissionCreateGate>

        {/* 編輯對話框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>修改傭金記錄</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 業務員 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-salesperson" className="w-24 text-center justify-center">
                  業務員
                </Label>
                <SalesUserSelect
                  value={formData.salesperson}
                  onChange={(value) => handleInputChange('salesperson', value)}
                  placeholder="選擇業務員"
                  className="flex-1"
                />
              </div>

              {/* 客戶名稱 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-customerName" className="w-24 text-center justify-center">
                  客戶名稱
                </Label>
                <Input
                  id="edit-customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="flex-1"
                  placeholder="輸入客戶名稱"
                />
              </div>

              {/* 產品類型 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-productType" className="w-24 text-center justify-center">
                  產品類型
                </Label>
                <Select value={formData.productType} onValueChange={(value) => handleInputChange('productType', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="選擇產品類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="房地產">房地產</SelectItem>
                    <SelectItem value="保險">保險</SelectItem>
                    <SelectItem value="諮詢">諮詢</SelectItem>
                    <SelectItem value="顧問費">顧問費</SelectItem>
                    <SelectItem value="基金">基金</SelectItem>
                    <SelectItem value="行銷">行銷</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 成交日期 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-contractDate" className="w-24 text-center justify-center">
                  成交日期
                </Label>
                <input
                  id="edit-contractDate"
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) => handleInputChange('contractDate', e.target.value)}
                  className="flex-1 h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ textAlign: 'center' }}
                />
              </div>

              {/* 業績 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-contractAmount" className="w-24 text-center justify-center">
                  業績
                </Label>
                <Input
                  id="edit-contractAmount"
                  value={formData.contractAmount}
                  onChange={(e) => handleNumberInput('contractAmount', e.target.value)}
                  className="flex-1"
                  placeholder="輸入業績金額"
                />
              </div>

              {/* 實拿金額 */}
              <div className="flex items-center gap-4">
                <Label htmlFor="edit-commissionAmount" className="w-24 text-center justify-center">
                  實拿金額
                </Label>
                <Input
                  id="edit-commissionAmount"
                  value={formData.commissionAmount}
                  onChange={(e) => handleNumberInput('commissionAmount', e.target.value)}
                  className="flex-1"
                  placeholder="輸入實拿金額"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                取消
              </Button>
              <Button
                onClick={handleUpdateRecord}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    修改中...
                  </>
                ) : (
                  '修改'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-2">
          <CardTitle className="text-xl">傭金明細</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">

        {/* 表格區域 */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">業務員</TableHead>
              <TableHead className="text-center">客戶</TableHead>
              <TableHead className="text-center">產品類型</TableHead>
              <TableHead className="text-center">成交日期</TableHead>
              <TableHead className="text-center">業績</TableHead>
              <TableHead className="text-center">實拿金額</TableHead>
              <TableHead className="text-center w-16"></TableHead>
              <TableHead className="text-center w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    <span className="ml-2">載入中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                  暫無傭金記錄
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center font-medium py-3">
                    {formatSalesName(item.salesUserId, item.salesName)}
                  </TableCell>
                  <TableCell className="text-center py-3">{item.customerName}</TableCell>
                  <TableCell className="text-center py-3">{item.productType}</TableCell>
                  <TableCell className="text-center py-3">{formatDate(item.contractDate)}</TableCell>
                  <TableCell className="text-center py-3">{formatCurrency(item.contractAmount)}</TableCell>
                  <TableCell className="text-center font-bold text-green-600 py-3">
                    {formatCurrency(item.commissionAmount)}
                  </TableCell>
                  <TableCell className="text-center py-3 w-16">
                    <CommissionEditGate showFallback fallback={<div className="w-9 h-9" />}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CommissionEditGate>
                  </TableCell>
                  <TableCell className="text-center py-3 w-16">
                    <CommissionDeleteGate showFallback fallback={<div className="w-9 h-9" />}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CommissionDeleteGate>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分頁控制元件 */}
        {total > 0 && (
          <div className="flex items-center justify-between px-0 py-4 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                每頁顯示
              </p>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <p className="text-sm text-muted-foreground">
                筆，共 {total} 筆資料
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                第 {page} 頁，共 {totalPages} 頁
              </p>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* 頁碼按鈕 */}
                {Array.from(
                  {
                    length: Math.min(5, totalPages),
                  },
                  (_, i) => {
                    const startPage = Math.max(1, page - 2);
                    const pageNum = startPage + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page >= totalPages || loading}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
            </CardContent>
          </Card>

          {/* 刪除確認對話框 */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>確認刪除</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  確定要刪除這筆傭金記錄嗎？此操作無法復原。
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      刪除中...
                    </>
                  ) : (
                    '確認刪除'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Toast 通知 */}
          <ToastManager toasts={toasts} onRemove={removeToast} />
        </div>
      );
    }
