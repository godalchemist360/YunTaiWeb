'use client';

import { Logo } from '@/components/layout/logo';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { cn } from '@/lib/utils';

interface CalculatorNavbarProps {
  activeTab?: 'inflation' | 'financial-planning' | 'loan';
  onTabChange?: (tab: 'inflation' | 'financial-planning' | 'loan') => void;
}

export function CalculatorNavbar({
  activeTab = 'inflation',
  onTabChange,
}: CalculatorNavbarProps) {
  const tabs = [
    { id: 'inflation' as const, label: '通膨計算器' },
    { id: 'financial-planning' as const, label: '理財規劃計算器' },
    { id: 'loan' as const, label: '貸款計算器' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左側：Logo */}
          <div className="flex items-center">
            <LocaleLink href={Routes.Root} className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
            </LocaleLink>
          </div>

          {/* 中間：導航選項 */}
          <div className="hidden md:flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 右側：空白區域 */}
          <div className="flex items-center gap-4">
            {/* 預留空間，保持布局平衡 */}
          </div>
        </div>

        {/* 移動端：導航選項 */}
        <div className="md:hidden flex items-center gap-2 pb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

