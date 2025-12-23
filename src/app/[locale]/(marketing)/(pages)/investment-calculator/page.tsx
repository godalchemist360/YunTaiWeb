import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { InvestmentCalculatorClient } from './investment-calculator-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: '投資計算器 | ' + t('title'),
    description: '投資計算器 - IRR計算器、理財規劃計算器、通膨計算器',
    canonicalUrl: getUrlWithLocale('/investment-calculator', locale),
  });
}

export default async function InvestmentCalculatorPage() {
  return <InvestmentCalculatorClient />;
}

