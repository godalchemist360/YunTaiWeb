'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import Container from '@/components/layout/container';
import { CustomUserButton } from '@/components/layout/custom-user-button';
// Removed logo, mode switcher, and mobile navbar
import { UserButton } from '@/components/layout/user-button';
import { Button, buttonVariants } from '@/components/ui/button';
import { useCustomUser } from '@/hooks/use-custom-user';
// Removed navigation menu imports
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
// Removed locale switcher

interface NavBarProps {
  scroll?: boolean;
}

// Removed menu style

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  // Simplified navbar: no menus
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const { user: customUser, isLoading: customUserLoading } = useCustomUser();
  // console.log(`Navbar, user:`, user);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 檢查是否有自定義登入的使用者
  const hasCustomUser = customUser && !customUserLoading;

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        scroll
          ? scrolled
            ? 'bg-muted/50 backdrop-blur-md border-b supports-backdrop-filter:bg-muted/50'
            : 'bg-transparent'
          : 'border-b bg-muted/50'
      )}
    >
      <Container className="px-4">
        <nav className="flex items-center justify-between">
          {/* 左側：Logo 或網站名稱 */}
          <div className="flex items-center">
            <LocaleLink href={Routes.Root} className="flex items-center gap-2">
              <span className="text-xl font-semibold">
                {t('Metadata.name')}
              </span>
            </LocaleLink>
          </div>

          {/* 右側：使用者資訊或登入按鈕 */}
          <div className="flex items-center gap-x-4">
            {!mounted || isPending || customUserLoading ? (
              <Skeleton className="size-8 border rounded-full" />
            ) : hasCustomUser ? (
              // 顯示自定義使用者
              <CustomUserButton user={customUser} />
            ) : currentUser ? (
              // 顯示 Better Auth 使用者
              <UserButton user={currentUser} />
            ) : (
              // 顯示登入按鈕
              <LoginWrapper mode="modal" asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  {t('Common.login')}
                </Button>
              </LoginWrapper>
            )}
          </div>
        </nav>
      </Container>
    </section>
  );
}
