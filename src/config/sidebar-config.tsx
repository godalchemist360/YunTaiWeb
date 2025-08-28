'use client';

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

  // if is demo website, allow user to access admin and user pages, but data is fake
  const isDemo = isDemoWebsite();

  return [
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
    {
      title: t('customerData.title'),
      icon: <UserCheckIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCustomerData,
      external: false,
    },
    {
      title: t('commissionQuery.title'),
      icon: <CalculatorIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCommissionQuery,
      external: false,
    },
    {
      title: t('dataUpload.title'),
      icon: <UploadIcon className="size-4 shrink-0" />,
      href: Routes.DashboardDataUpload,
      external: false,
    },
    {
      title: t('training.title'),
      icon: <GraduationCapIcon className="size-4 shrink-0" />,
      href: Routes.DashboardTraining,
      external: false,
    },
    {
      title: t('customerTracking.title'),
      icon: <SearchIcon className="size-4 shrink-0" />,
      href: Routes.DashboardCustomerTracking,
      external: false,
    },
    {
      title: t('analytics.title'),
      icon: <BarChart3Icon className="size-4 shrink-0" />,
      href: Routes.DashboardAnalytics,
      external: false,
    },
    {
      title: t('accountManagement.title'),
      icon: <UsersIcon className="size-4 shrink-0" />,
      href: Routes.DashboardAccountManagement,
      external: false,
    },
  ];
}
