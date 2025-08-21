'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { UserButton } from '@/components/layout/user-button';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function LoginFloating() {
  const t = useTranslations();
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed z-50 top-6 right-6">
      {!mounted || isPending ? (
        <Skeleton className="size-8 border rounded-full" />
      ) : session?.user ? (
        <UserButton user={session.user} />
      ) : (
        <LoginWrapper mode="modal" asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            {t('Common.login')}
          </Button>
        </LoginWrapper>
      )}
    </div>
  );
}


