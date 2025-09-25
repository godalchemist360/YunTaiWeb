'use client';

import { BottomLink } from '@/components/auth/bottom-link';
import { Logo } from '@/components/layout/logo';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  headerLabel: string;
  bottomButtonLabel: string;
  bottomButtonHref: string;
  className?: string;
}

export const AuthCard = ({
  children,
  headerLabel,
  bottomButtonLabel,
  bottomButtonHref,
  className,
}: AuthCardProps) => {
  return (
    <Card className={cn('bg-white border-transparent rounded-2xl relative', className)}>

      <CardHeader className="flex flex-col items-center pt-8 pb-6">
        <LocaleLink href="/" prefetch={false}>
          <Logo className="mb-4" />
        </LocaleLink>
        <CardDescription className="text-gray-700 font-medium text-lg">{headerLabel}</CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        {children}
      </CardContent>

      <CardFooter className="pt-0">
        {bottomButtonLabel ? (
          <BottomLink label={bottomButtonLabel} href={bottomButtonHref} />
        ) : null}
      </CardFooter>
    </Card>
  );
};
