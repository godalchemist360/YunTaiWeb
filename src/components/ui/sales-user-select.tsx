'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SalesUserOption {
  id: number;
  label: string;
}

interface SalesUserSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SalesUserSelect({
  value,
  onChange,
  placeholder = "選擇業務員",
  disabled = false,
  className
}: SalesUserSelectProps) {
  const [options, setOptions] = useState<SalesUserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/sales/options');
        const result = await response.json();

        if (result.success) {
          setOptions(result.data);
        } else {
          setError('載入業務員資料失敗');
        }
      } catch (err) {
        console.error('Error fetching sales options:', err);
        setError('載入業務員資料失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>載入中...</span>
          </div>
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <span className="text-red-500">{error}</span>
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
