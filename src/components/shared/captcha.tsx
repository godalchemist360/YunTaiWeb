'use client';

import { FormMessage } from '@/components/ui/form';
import { websiteConfig } from '@/config/website';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const Turnstile = dynamic(
  () => import('@marsidev/react-turnstile').then((mod) => mod.Turnstile),
  {
    ssr: false,
  }
);

type Props = Omit<ComponentProps<typeof Turnstile>, 'siteKey'> & {
  validationError?: string;
};

/**
 * Captcha component for Cloudflare Turnstile
 */
export const Captcha = ({ validationError, ...props }: Props) => {
  const isTurnstileEnabled = websiteConfig.features.enableTurnstileCaptcha;
  const theme = useTheme();
  const locale = useLocale();

  return isTurnstileEnabled ? (
    <>
      <Turnstile
        options={{
          size: 'flexible',
          language: locale,
          theme: theme.theme === 'dark' ? 'dark' : 'light',
        }}
        {...props}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
      />

      {validationError && (
        <FormMessage className="text-red-500 mt-2">
          {validationError}
        </FormMessage>
      )}
    </>
  ) : null;
};
