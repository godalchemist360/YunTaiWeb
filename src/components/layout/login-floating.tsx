'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function LoginFloating() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed z-50 top-6 right-6">
      {!mounted ? (
        <Skeleton className="size-8 border rounded-full" />
      ) : (
        <LoginWrapper mode="modal" asChild>
          <Button
            variant="outline"
            className="cursor-pointer bg-white border-white text-black hover:bg-gray-100 h-8 w-[54px] px-3 text-sm font-medium rounded-sm"
          >
            {t('Common.login')}
          </Button>
        </LoginWrapper>
      )}
    </div>
  );
}
