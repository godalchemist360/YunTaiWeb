'use client';

import { CalculatorNavbar } from '@/components/investment-calculator/calculator-navbar';
import { FlexibleCalculator } from '@/components/investment-calculator/flexible-calculator';
import { InflationCalculator } from '@/components/investment-calculator/inflation-calculator';
import { LoanCalculator } from '@/components/investment-calculator/loan-calculator';
import { useState } from 'react';

export function InvestmentCalculatorClient() {
  const [activeTab, setActiveTab] = useState<
    'inflation' | 'financial-planning' | 'loan'
  >('inflation');

  return (
    <div className="min-h-screen bg-background">
      <CalculatorNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inflation' && <InflationCalculator />}

        {activeTab === 'financial-planning' && <FlexibleCalculator />}

        {activeTab === 'loan' && <LoanCalculator />}
      </div>
    </div>
  );
}

