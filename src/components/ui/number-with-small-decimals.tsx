import { cn } from '@/lib/utils';

type NumberWithSmallDecimalsProps = {
  text: string;
  className?: string;
  integerClassName?: string;
  decimalsClassName?: string;
};

/**
 * 將已格式化的數字字串（例如 `1,234.56`）拆成「整數/小數」兩段顯示，
 * 讓小數部分字級更小以提升可讀性。
 *
 * 注意：此元件不負責格式化，只負責顯示。
 */
export function NumberWithSmallDecimals({
  text,
  className,
  integerClassName,
  decimalsClassName,
}: NumberWithSmallDecimalsProps) {
  const [integerPart, decimalsPart] = text.split('.');

  return (
    <span className={cn('inline-flex items-baseline', className)}>
      <span className={integerClassName}>{integerPart}</span>
      {decimalsPart ? (
        <span className={cn('text-[0.85em]', decimalsClassName)}>.{decimalsPart}</span>
      ) : null}
    </span>
  );
}

