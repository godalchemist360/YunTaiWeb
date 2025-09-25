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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-transparent transition-all duration-200">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer hover:bg-accent rounded-md p-1 transition-colors duration-200" />
        <Separator
          orientation="vertical"
          className="mx-2 h-6"
        />

        <Breadcrumb>
          <BreadcrumbList className="text-sm font-medium">
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
                    <BreadcrumbPage className="text-foreground font-semibold">{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink href={item.href} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{item.label}</span>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* dashboard header actions on the right side */}
        <div className="ml-auto flex items-center gap-2 pl-4">
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
