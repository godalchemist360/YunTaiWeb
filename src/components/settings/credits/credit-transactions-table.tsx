'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/formatter';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  RefreshCwIcon,
  GiftIcon,
  ShoppingCartIcon,
  MinusCircleIcon,
  ClockIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';
import { Label } from '../../ui/label';
import { CREDIT_TRANSACTION_TYPE } from '@/lib/constants';

// Define the credit transaction interface
interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  description: string | null;
  amount: number;
  remainingAmount: number | null;
  paymentId: string | null;
  expirationDate: Date | null;
  expirationDateProcessedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: any;
  title: string;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className={className}>
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 data-[state=open]:bg-accent"
      >
        <span>{title}</span>
        <ArrowUpDownIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface CreditTransactionsTableProps {
  data: CreditTransaction[];
  total: number;
  pageIndex: number;
  pageSize: number;
  search: string;
  loading?: boolean;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

export { type CreditTransaction };

export function CreditTransactionsTable({
  data,
  total,
  pageIndex,
  pageSize,
  search,
  loading,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: CreditTransactionsTableProps) {
  const t = useTranslations('Dashboard.admin.creditTransactions');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // show fake data in demo website
  const isDemo = process.env.NEXT_PUBLIC_DEMO_WEBSITE === 'true';

  // Map column IDs to translation keys
  const columnIdToTranslationKey = {
    type: 'columns.type' as const,
    amount: 'columns.amount' as const,
    remainingAmount: 'columns.remainingAmount' as const,
    description: 'columns.description' as const,
    paymentId: 'columns.paymentId' as const,
    expirationDate: 'columns.expirationDate' as const,
    expirationDateProcessedAt: 'columns.expirationDateProcessedAt' as const,
    createdAt: 'columns.createdAt' as const,
    updatedAt: 'columns.updatedAt' as const,
  } as const;

  // Get transaction type icon and color
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH:
        return <RefreshCwIcon className="h-4 w-4 text-blue-500" />;
      case CREDIT_TRANSACTION_TYPE.REGISTER_GIFT:
        return <GiftIcon className="h-4 w-4 text-green-500" />;
      case CREDIT_TRANSACTION_TYPE.PURCHASE:
        return <ShoppingCartIcon className="h-4 w-4 text-purple-500" />;
      case CREDIT_TRANSACTION_TYPE.USAGE:
        return <MinusCircleIcon className="h-4 w-4 text-red-500" />;
      case CREDIT_TRANSACTION_TYPE.EXPIRE:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case CREDIT_TRANSACTION_TYPE.REGISTER_GIFT:
        return 'bg-green-100 text-green-800 border-green-200';
      case CREDIT_TRANSACTION_TYPE.PURCHASE:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case CREDIT_TRANSACTION_TYPE.USAGE:
        return 'bg-red-100 text-red-800 border-red-200';
      case CREDIT_TRANSACTION_TYPE.EXPIRE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Table columns definition
  const columns: ColumnDef<CreditTransaction>[] = [
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.type')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <Badge
              variant="outline"
              className={`px-2 py-1 flex items-center gap-1 ${getTransactionTypeColor(transaction.type)}`}
            >
              {getTransactionTypeIcon(transaction.type)}
              {transaction.type}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.amount')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <span
              className={`font-medium ${
                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.amount > 0 ? '+' : ''}
              {transaction.amount.toLocaleString()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'remainingAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.remainingAmount')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {transaction.remainingAmount !== null ? (
              <span className="font-medium text-gray-600">
                {transaction.remainingAmount.toLocaleString()}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.description')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <span className="max-w-[200px] truncate" title={transaction.description || undefined}>
              {transaction.description || '-'}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.paymentId')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {transaction.paymentId ? (
              <Badge
                variant="outline"
                className="text-sm px-1.5 cursor-pointer hover:bg-accent max-w-[150px]"
                onClick={() => {
                  navigator.clipboard.writeText(transaction.paymentId!);
                  toast.success(t('paymentIdCopied'));
                }}
              >
                <span className="truncate">{transaction.paymentId}</span>
              </Badge>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'expirationDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.expirationDate')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {transaction.expirationDate ? (
              <span className="text-sm">
                {formatDate(transaction.expirationDate)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'expirationDateProcessedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.expirationDateProcessedAt')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            {transaction.expirationDateProcessedAt ? (
              <span className="text-sm">
                {formatDate(transaction.expirationDateProcessedAt)}
              </span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <span className="text-sm">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.updatedAt')} />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex items-center gap-2 pl-3">
            <span className="text-sm">
              {formatDate(transaction.updatedAt)}
            </span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      onSortingChange?.(next);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      if (next.pageIndex !== pageIndex) onPageChange(next.pageIndex);
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="w-full flex-col justify-start gap-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Input
            placeholder={t('search')}
            value={search}
            onChange={(event) => {
              onSearch(event.target.value);
              onPageChange(0);
            }}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <span className="inline">{t('columns.columns')}</span>
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {t(
                      columnIdToTranslationKey[
                        column.id as keyof typeof columnIdToTranslationKey
                      ] || 'columns.columns'
                    )}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? t('loading') : t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {total > 0 && (
            <span>
              {t('totalRecords', { count: total })}
            </span>
          )}
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              {t('rowsPerPage')}
            </Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
                onPageChange(0);
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-20 cursor-pointer"
                id="rows-per-page"
              >
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            {t('page')} {pageIndex + 1} {' / '}
            {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t('goToFirstPage')}</span>
              <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t('goToPreviousPage')}</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pageIndex + 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t('goToNextPage')}</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(Math.ceil(total / pageSize) - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t('goToLastPage')}</span>
              <ChevronsRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
