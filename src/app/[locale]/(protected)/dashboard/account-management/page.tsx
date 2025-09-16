'use client';

import { AddAccountDialog } from '@/components/account-management/add-account-dialog';
import { EditAccountDialog } from '@/components/account-management/edit-account-dialog';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createUser,
  deleteUser,
  fetchStats,
  fetchUsers,
  updateUser,
} from '@/lib/usersClient';
import { usePermissions } from '@/hooks/use-permissions';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Filter,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AccountManagementPage() {
  const { isSales, isLoading: permissionsLoading } = usePermissions();

  // 所有 hooks 必須在條件性返回之前調用
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    disabled: 0,
    admin_count: 0,
    management_count: 0,
  });

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 搜尋和篩選狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 刪除確認對話框狀態
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    displayName: string;
  } | null>(null);

  const breadcrumbs = [
    {
      label: '帳號管理',
      isCurrentPage: true,
    },
  ];

  // 定義 loadData 函數（必須在 useEffect 之前）
  const loadData = async (page = currentPage, size = pageSize, search = searchQuery, role = selectedRole) => {
    try {
      setLoading(true);

      const [statsData, usersData] = await Promise.all([
        fetchStats(),
        fetchUsers({
          page,
          pageSize: size,
          q: search || undefined,
          role: role === 'all' ? undefined : role
        }),
      ]);

      // 統計卡片永遠顯示真實的總數（不受篩選影響）
      setStats(statsData);

      // 表格顯示篩選後的結果
      setAccounts(usersData.items || []);
      setTotalCount(usersData.total || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 所有 useEffect hooks 必須在條件性返回之前
  useEffect(() => {
    loadData();
  }, []);

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // 權限檢查：sales 用戶無權限訪問此頁面
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (isSales()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">無權限訪問</h1>
          <p className="text-gray-600">您的身份組無權限訪問此頁面</p>
        </div>
      </div>
    );
  }

  // 分頁控制函數
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadData(page, pageSize, searchQuery, selectedRole);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 重置到第一頁
    loadData(1, size, searchQuery, selectedRole);
  };

  // 搜尋功能（防抖動 300ms）
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // 重置到第一頁

    // 清除之前的 timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 設置新的 timeout
    const timeout = setTimeout(() => {
      loadData(1, pageSize, value, selectedRole);
    }, 300);

    setSearchTimeout(timeout);
  };

  // 篩選功能
  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1); // 重置到第一頁
    loadData(1, pageSize, searchQuery, role);
  };

  const handleAddUser = async (formData: {
    displayName: string;
    username: string;
    password: string;
    level: string;
  }) => {
    // 基本驗證
    if (!formData.displayName || !formData.username || !formData.password) {
      alert('請填寫所有必填欄位');
      return;
    }

    try {
      await createUser({
        account: formData.username,
        display_name: formData.displayName,
        role: formData.level,
        status: 'active',
        password: formData.password,
      });

      // 成功後關閉彈窗並重新載入資料
      setIsAddDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('新增帳號失敗');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';

    try {
      await updateUser(id, { status: nextStatus });
      await loadData();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('更新狀態失敗');
    }
  };

  const handleEditAccount = async (formData: {
    id: number;
    display_name: string;
    role: string;
    password?: string;
  }) => {
    try {
      const payload: any = {
        display_name: formData.display_name,
        role: formData.role,
      };

      // 如果有密碼，則加入密碼欄位
      if (formData.password) {
        payload.password = formData.password;
      }

      await updateUser(formData.id, payload);
      await loadData();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      throw error; // 讓編輯彈窗處理錯誤
    }
  };

  const handleOpenEditDialog = (account: any) => {
    setSelectedAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = async (id: number, displayName: string) => {
    setDeleteTarget({ id, displayName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('刪除帳號失敗');
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge variant="destructive">管理員</Badge>;
      case 'management':
        return <Badge variant="secondary">管理層</Badge>;
      case 'sales':
        return <Badge variant="outline">業務員</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string, id: number) => {
    const handleClick = () => handleToggleStatus(id, status);

    switch (status) {
      case 'active':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 bg-green-100 text-green-800 hover:bg-green-200"
            onClick={handleClick}
          >
            啟用
          </Button>
        );
      case 'disabled':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={handleClick}
          >
            停用
          </Button>
        );
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1"
            onClick={handleClick}
          >
            {status}
          </Button>
        );
    }
  };

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      帳號管理
                    </h1>
                    <p className="text-gray-600">
                      管理系統用戶帳號，包含創建、編輯和刪除功能
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        總帳號數
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.total}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        啟用帳號
                      </CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.active}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        停用帳號
                      </CardTitle>
                      <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {stats.disabled}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        管理層
                      </CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.management_count}
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
                        placeholder="搜尋使用者姓名..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          篩選
                          {selectedRole !== 'all' && (
                            <Badge variant="secondary" className="ml-2">
                              {selectedRole === 'admin' ? '管理員' :
                               selectedRole === 'management' ? '管理層' :
                               selectedRole === 'sales' ? '業務員' : selectedRole}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleFilter('all')}
                          className={selectedRole === 'all' ? 'bg-accent' : ''}
                        >
                          全部
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleFilter('admin')}
                          className={selectedRole === 'admin' ? 'bg-accent' : ''}
                        >
                          管理員
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleFilter('management')}
                          className={selectedRole === 'management' ? 'bg-accent' : ''}
                        >
                          管理層
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleFilter('sales')}
                          className={selectedRole === 'sales' ? 'bg-accent' : ''}
                        >
                          業務員
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    新增帳號
                  </Button>
                </div>

                {/* Accounts Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>帳號列表</CardTitle>
                    <CardDescription>
                      顯示所有系統帳號，您可以在此管理帳號資訊
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>使用者姓名</TableHead>
                          <TableHead>帳號</TableHead>
                          <TableHead>帳號層級</TableHead>
                          <TableHead>狀態</TableHead>
                          <TableHead>建立時間</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <span className="ml-2">載入中...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : accounts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              無符合條件的帳號
                            </TableCell>
                          </TableRow>
                        ) : (
                          accounts.map((account: any) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">
                                {account.display_name}
                              </TableCell>
                              <TableCell>{account.account}</TableCell>
                              <TableCell>{getLevelBadge(account.role)}</TableCell>
                              <TableCell>
                                {getStatusBadge(account.status, account.id)}
                              </TableCell>
                              <TableCell>{account.created_date}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEditDialog(account)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      handleDeleteUser(
                                        account.id,
                                        account.display_name
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>

                  {/* 分頁控制元件 */}
                  {totalCount > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          每頁顯示
                        </p>
                        <select
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                          className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <p className="text-sm text-muted-foreground">
                          筆，共 {totalCount} 筆資料
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground">
                          第 {currentPage} 頁，共 {Math.ceil(totalCount / pageSize)} 頁
                        </p>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1 || loading}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          {/* 頁碼按鈕 */}
                          {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                            const startPage = Math.max(1, currentPage - 2);
                            const pageNum = startPage + i;
                            if (pageNum > Math.ceil(totalCount / pageSize)) return null;

                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                disabled={loading}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(Math.ceil(totalCount / pageSize))}
                            disabled={currentPage >= Math.ceil(totalCount / pageSize) || loading}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Dialog */}
      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddUser}
      />

      {/* Edit Account Dialog */}
      <EditAccountDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        account={selectedAccount}
        onSubmit={handleEditAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>系統提醒</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除帳號「{deleteTarget?.displayName}」嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
