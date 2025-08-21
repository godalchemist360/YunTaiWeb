import { LoginFloating } from '@/components/layout/login-floating';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <LoginFloating />
      <main className="flex-1">{children}</main>
    </div>
  );
}
