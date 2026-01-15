import type { ComponentProps } from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';

import { Input } from '@/components/ui/input';

// NumericFormat 的 defaultValue 只接受 string | number；
// 但 Input 的 defaultValue 可能包含 string[]，會造成 Next build 的型別錯誤。
// 我們這裡固定採用 controlled value，因此直接排除 defaultValue。
type BaseInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type' | 'defaultValue'>;

export type FormattedNumberInputProps = BaseInputProps & {
  /** 僅儲存「純數字字串」（不含逗號），例如：`1000000`、`2.5`、`` */
  value: string;
  /** 回傳「純數字字串」（不含逗號） */
  onValueChange: (rawValue: string) => void;
  thousandSeparator?: boolean | string;
  decimalScale?: number;
  allowNegative?: boolean;
} & Pick<
    NumericFormatProps,
    | 'inputMode'
    | 'allowedDecimalSeparators'
    | 'decimalSeparator'
    | 'fixedDecimalScale'
    | 'allowLeadingZeros'
    | 'isAllowed'
  >;

/**
 * 顯示時自動加上千分位逗號（1,000,000），但內部 state 維持純數字字串（1000000）。
 * 使用 react-number-format 以確保游標位置/刪除/貼上體驗正確。
 */
export function FormattedNumberInput({
  value,
  onValueChange,
  thousandSeparator = ',',
  decimalSeparator = '.',
  allowedDecimalSeparators,
  decimalScale,
  fixedDecimalScale,
  allowNegative = false,
  allowLeadingZeros = false,
  inputMode = 'decimal',
  isAllowed,
  ...rest
}: FormattedNumberInputProps) {
  return (
    <NumericFormat
      value={value}
      valueIsNumericString
      thousandSeparator={thousandSeparator}
      decimalSeparator={decimalSeparator}
      allowedDecimalSeparators={allowedDecimalSeparators}
      decimalScale={decimalScale}
      fixedDecimalScale={fixedDecimalScale}
      allowNegative={allowNegative}
      allowLeadingZeros={allowLeadingZeros}
      inputMode={inputMode}
      isAllowed={isAllowed}
      customInput={Input}
      onValueChange={(values) => onValueChange(values.value)}
      {...rest}
    />
  );
}

