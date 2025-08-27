import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
  Users,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  UserPlus,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function AccountManagementPage() {
  const breadcrumbs = [
    {
      label: '帳號管理',
      isCurrentPage: true,
    },
  ];

  // 模擬帳號數據
  const accounts = [
    {
      id: 1,
      username: 'admin001',
      password: '********',
      displayName: '系統管理員',
      level: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      username: 'user001',
      password: '********',
      displayName: '張小明',
      level: 'user',
      status: 'active',
      createdAt: '2024-01-05',
    },
    {
      id: 3,
      username: 'manager001',
      password: '********',
      displayName: '李經理',
      level: 'manager',
      status: 'active',
      createdAt: '2024-01-10',
    },
    {
      id: 4,
      username: 'user002',
      password: '********',
      displayName: '王小花',
      level: 'user',
      status: 'inactive',
      createdAt: '2024-01-15',
    },
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge variant="destructive">管理員</Badge>;
      case 'manager':
        return <Badge variant="secondary">經理</Badge>;
      case 'user':
        return <Badge variant="outline">一般用戶</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">啟用</Badge>;
      case 'inactive':
        return <Badge variant="secondary">停用</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                    <h1 className="text-3xl font-bold text-gray-900">帳號管理</h1>
                    <p className="text-gray-600">
                      管理系統用戶帳號，包含創建、編輯和刪除功能
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">總帳號數</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{accounts.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">啟用帳號</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {accounts.filter(acc => acc.status === 'active').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">停用帳號</CardTitle>
                      <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {accounts.filter(acc => acc.status === 'inactive').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">管理員</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {accounts.filter(acc => acc.level === 'admin').length}
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
                        placeholder="搜尋帳號..."
                        className="pl-8"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      篩選
                    </Button>
                  </div>
                  <Button>
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
                          <TableHead>帳號</TableHead>
                          <TableHead>使用者姓名</TableHead>
                          <TableHead>帳號層級</TableHead>
                          <TableHead>狀態</TableHead>
                          <TableHead>建立時間</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.username}</TableCell>
                            <TableCell>{account.displayName}</TableCell>
                            <TableCell>{getLevelBadge(account.level)}</TableCell>
                            <TableCell>{getStatusBadge(account.status)}</TableCell>
                            <TableCell>{account.createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
