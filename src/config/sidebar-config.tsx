'use client';

import { usePermissions } from '@/hooks/use-permissions';
import { isDemoWebsite } from '@/lib/demo';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  BarChart3Icon,
  BellIcon,
  CalculatorIcon,
  CircleUserRoundIcon,
  CoinsIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  MegaphoneIcon,
  NetworkIcon,
  SearchIcon,
  Settings2Icon,
  SettingsIcon,
  UploadIcon,
  UserCheckIcon,
  UsersIcon,
  UsersRoundIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get sidebar config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/sidebar
 *
 * @returns The sidebar config with translated titles and descriptions
 */
export function getSidebarLinks(): NestedMenuItem[] {
  const t = useTranslations('Dashboard');
  const { isSales, isLoading } = usePermissions();

  // if is demo website, allow user to access admin and user pages, but data is fake
  const isDemo = isDemoWebsite();

  // 定義需要管理權限（admin 和 management）才能訪問的路由
  const adminOnlyRoutes: string[] = [
    Routes.DashboardCustomerData,
    Routes.DashboardDataUpload,
    Routes.DashboardTraining,
    Routes.DashboardAnalytics,
    Routes.DashboardAccountManagement,
  ];

  // 基礎導航項目
  const baseLinks: NestedMenuItem[] = [
    {
      title: t('announcements.title'),
      icon: <MegaphoneIcon className="size-4 shrink-0" />,
      href: Routes.DashboardAnnouncements,
      external: false,
    },
    {
      title: t('salesSupport.title'),
      icon: <HeadphonesIcon className="size-4 shrink-0" />,
      href: Routes.DashboardSalesSupport,
      external: false,
    },
    // 以下頁面僅限 admin 和 management 訪問
    {
      title: t('customerData.title'),
      icon: <UserCheckIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCustomerData,
      external: false,
      isGrayed: true,
    },
    {
      title: t('organizationChart.title'),
      icon: <NetworkIcon className="size-4 shrink-0" />,
      href: Routes.DashboardOrganizationChart,
      external: false,
    },
    {
      title: t('commissionQuery.title'),
      icon: <CalculatorIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCommissionQuery,
      external: false,
    },
    // 以下頁面僅限 admin 和 management 訪問
    {
      title: t('dataUpload.title'),
      icon: <UploadIcon className="size-4 shrink-0" />,
      href: Routes.DashboardDataUpload,
      external: false,
      isGrayed: true,
    },
    // 以下頁面僅限 admin 和 management 訪問
    {
      title: t('training.title'),
      icon: <GraduationCapIcon className="size-4 shrink-0" />,
      href: Routes.DashboardTraining,
      external: false,
      isGrayed: true,
    },
    {
      title: t('customerTracking.title'),
      icon: <SearchIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCustomerTracking,
      external: false,
    },
    // 以下頁面僅限 admin 和 management 訪問
    {
      title: t('analytics.title'),
      icon: <BarChart3Icon className="size-4 shrink-0" />,
      href: Routes.DashboardAnalytics,
      external: false,
      isGrayed: true,
    },
  ];

  // 只有在權限載入完成後才決定是否顯示需要管理權限的項目和帳號管理
  // 這樣可以避免載入期間的閃爍效果
  if (!isLoading) {
    // 過濾掉 sales 用戶不應該看到的項目
    const filteredLinks = baseLinks.filter((link) => {
      // 如果路由需要管理權限，且用戶是 sales，則過濾掉
      if (link.href && adminOnlyRoutes.includes(link.href) && isSales()) {
        return false;
      }
      return true;
    });

    // 如果不是 sales 用戶，添加帳號管理
    if (!isSales()) {
      filteredLinks.push({
        title: t('accountManagement.title'),
        icon: <UsersIcon className="size-4 shrink-0" />,
        href: Routes.DashboardAccountManagement,
        external: false,
      });
    }

    return filteredLinks;
  }

  // 權限載入中時，只返回不需要權限檢查的連結，避免受限連結閃現
  return baseLinks.filter((link) => {
    // 只返回不在 adminOnlyRoutes 中的連結，以及帳號管理（稍後再根據權限添加）
    return link.href && !adminOnlyRoutes.includes(link.href);
  });
}
