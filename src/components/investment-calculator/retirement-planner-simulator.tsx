'use client';

import { Card, CardContent } from '@/components/ui/card';

export function RetirementPlannerSimulator() {
  return (
    <Card>
      <CardContent className="pt-6 pb-8">
        <div className="space-y-2">
          <div className="text-lg font-semibold">退休規劃模擬器</div>
          <div className="text-sm text-muted-foreground">
            功能規劃中，請提供需求後我會接著實作。
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

