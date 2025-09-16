'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCustomUser } from '@/hooks/use-custom-user';
import { authClient } from '@/lib/auth-client';
import { isDemoWebsite } from '@/lib/demo';
import React, { type ReactNode } from 'react';
import { CreditsBalanceButton } from '../layout/credits-balance-button';
import { CustomUserButton } from '../layout/custom-user-button';
import LocaleSwitcher from '../layout/locale-switcher';
import { ModeSwitcher } from '../layout/mode-switcher';
import { ThemeSelector } from '../layout/theme-selector';
import { UserButton } from '../layout/user-button';
import { Skeleton } from '../ui/skeleton';

interface DashboardBreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface DashboardHeaderProps {
  breadcrumbs: DashboardBreadcrumbItem[];
  actions?: ReactNode;
}

/**
 * Dashboard header
 */
export function DashboardHeader({
  breadcrumbs,
  actions,
}: DashboardHeaderProps) {
  const isDemo = isDemoWebsite();
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const { user: customUser, isLoading: customUserLoading } = useCustomUser();

  // 檢查是否有自定義登入的使用者
  const hasCustomUser = customUser && !customUserLoading;

  // 添加調試日誌
  console.log('DashboardHeader: 調試資訊', {
    isDemo,
    session,
    isPending,
    currentUser,
    customUser,
    customUserLoading,
    hasCustomUser,
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Breadcrumb>
          <BreadcrumbList className="text-base font-medium">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`breadcrumb-${index}`}>
                {index > 0 && (
                  <BreadcrumbSeparator
                    key={`sep-${index}`}
                    className="hidden md:block"
                  />
                )}
                <BreadcrumbItem
                  key={`item-${index}`}
                  className={
                    index < breadcrumbs.length - 1 ? 'hidden md:block' : ''
                  }
                >
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    item.label
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* dashboard header actions on the right side */}
        <div className="ml-auto flex items-center gap-3 pl-4">
          {actions}

          {/* 使用者資訊顯示 */}
          {isPending || customUserLoading ? (
            <Skeleton className="size-8 border rounded-full" />
          ) : hasCustomUser ? (
            // 顯示自定義使用者
            <CustomUserButton user={customUser} />
          ) : currentUser ? (
            // 顯示 Better Auth 使用者
            <UserButton user={currentUser as any} />
          ) : null}

          <CreditsBalanceButton />
          <ModeSwitcher />
          <LocaleSwitcher />
          {isDemo && <ThemeSelector />}
        </div>
      </div>
    </header>
  );
}
