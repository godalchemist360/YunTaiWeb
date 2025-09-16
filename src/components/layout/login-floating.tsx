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
            size="sm"
            className="cursor-pointer bg-white border-white text-black hover:bg-gray-100"
          >
            {t('Common.login')}
          </Button>
        </LoginWrapper>
      )}
    </div>
  );
}
