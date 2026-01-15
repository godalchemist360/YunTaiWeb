'use client';

import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

export function LoginFloating() {
  const t = useTranslations();
  const router = useLocaleRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed z-50 top-6 right-6">
      {!mounted ? (
        <Skeleton className="size-8 border rounded-full" />
      ) : (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
                size="icon"
                className="cursor-pointer bg-gradient-to-br from-[#D4B86A] via-[#C5A651] to-[#A6893F] border-[#C5A651] text-white hover:from-[#C5A651] hover:via-[#B59747] hover:to-[#937835] hover:border-[#B59747] h-8 w-8 rounded-sm shadow-[0_2px_8px_rgba(197,166,81,0.4),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.2)] hover:shadow-[0_3px_12px_rgba(197,166,81,0.5),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.3)] transition-all duration-200"
          >
                <MenuIcon className="size-4 drop-shadow-sm" />
                <span className="sr-only">選單</span>
          </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsLoginDialogOpen(true)}
              >
                <span>登入</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  router.push(Routes.InvestmentCalculator);
                }}
              >
                <span>投資計算器</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
            <DialogContent className="sm:max-w-[400px] p-0 bg-transparent border-none shadow-none">
              <DialogHeader className="hidden">
                <DialogTitle />
              </DialogHeader>
              <LoginForm className="border-none" />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
