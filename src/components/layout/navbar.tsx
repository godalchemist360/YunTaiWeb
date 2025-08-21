'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import Container from '@/components/layout/container';
// Removed logo, mode switcher, and mobile navbar
import { UserButton } from '@/components/layout/user-button';
import { Button, buttonVariants } from '@/components/ui/button';
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
  // console.log(`Navbar, user:`, user);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <nav className="flex items-center justify-end">
          <div className="flex items-center gap-x-4">
            {!mounted || isPending ? (
              <Skeleton className="size-8 border rounded-full" />
            ) : currentUser ? (
              <UserButton user={currentUser} />
            ) : (
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
