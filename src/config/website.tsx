import { PaymentTypes, PlanIntervals } from '@/payment/types';
import type { WebsiteConfig } from '@/types';

/**
 * website config, without translations
 *
 * docs:
 * https://mksaas.com/docs/config/website
 */
export const websiteConfig: WebsiteConfig = {
  metadata: {
    theme: {
      defaultTheme: 'default',
      enableSwitch: true,
    },
    mode: {
      defaultMode: 'system',
      enableSwitch: true,
    },
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
    social: {
      github: 'https://github.com/MkSaaSHQ',
      twitter: 'https://mksaas.link/twitter',
      blueSky: 'https://mksaas.link/bsky',
      discord: 'https://mksaas.link/discord',
      mastodon: 'https://mksaas.link/mastodon',
      linkedin: 'https://mksaas.link/linkedin',
      youtube: 'https://mksaas.link/youtube',
    },
  },
  features: {
    enableDiscordWidget: false,
    enableUpgradeCard: true,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false,
    enableDatafastRevenueTrack: false,
    enableTurnstileCaptcha: true,
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false,
  },
  auth: {
    enableGoogleLogin: true,
    enableGithubLogin: true,
  },
  i18n: {
    defaultLocale: 'en',
    locales: {
      en: {
        flag: '🇺🇸',
        name: 'English',
      },
      zh: {
        flag: '🇨🇳',
        name: '中文',
      },
    },
  },
  blog: {
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  mail: {
    provider: 'resend',
    fromEmail: 'MkSaaS <support@mksaas.com>',
    supportEmail: 'MkSaaS <support@mksaas.com>',
  },
  newsletter: {
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  storage: {
    provider: 's3',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
            amount: 990,
            currency: 'USD',
            interval: PlanIntervals.MONTH,
          },
          {
            type: PaymentTypes.SUBSCRIPTION,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
            amount: 9900,
            currency: 'USD',
            interval: PlanIntervals.YEAR,
          },
        ],
        isFree: false,
        isLifetime: false,
        recommended: true,
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: PaymentTypes.ONE_TIME,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!,
            amount: 19900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
      },
    },
  },
  credits: {
    enableCredits: true,
    creditExpireDays: 30,
    registerGiftCredits: {
      enable: true,
      credits: 100,
    },
    freeMonthlyCredits: {
      enable: true,
      credits: 50,
    },
    packages: {
      basic: {
        id: 'basic',
        credits: 100,
        price: 990,
        popular: false,
      },
      standard: {
        id: 'standard',
        credits: 200,
        price: 1490,
        popular: true,
      },
      premium: {
        id: 'premium',
        credits: 500,
        price: 3990,
        popular: false,
      },
      enterprise: {
        id: 'enterprise',
        credits: 1000,
        price: 6990,
        popular: false,
      },
    },
  },
};
