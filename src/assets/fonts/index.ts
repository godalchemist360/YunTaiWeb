import {
  Bricolage_Grotesque,
  Noto_Sans,
  Noto_Sans_Mono,
  Noto_Serif,
} from 'next/font/google';

/**
 * 1. Fonts Documentation
 * https://mksaas.com/docs/fonts
 *
 * 2. This file shows how to customize the font by using local font or google font
 *
 * [1] use local font
 *
 * - Get font file from https://gwfh.mranftl.com/fonts
 * - Add font file to the assets/fonts folder
 * - Add font variable to the font object
 */
// https://gwfh.mranftl.com/fonts/bricolage-grotesque?subsets=latin
// export const fontBricolageGrotesque = localFont({
//   src: './Bricolage Grotesque-grotesque-v7-latin-regular.woff2',
//   variable: '--font-bricolage-grotesque',
// });

/**
 * [2] use google font
 *
 * - You can browser fonts at Google Fonts
 * https://fonts.google.com
 *
 * - CSS and font files are downloaded at build time and self-hosted with the rest of your static assets.
 * https://nextjs.org/docs/app/building-your-application/optimizing/fonts#google-fonts
 */
// https://fonts.google.com/noto/specimen/Noto+Sans
// 預載入主要字體 - 立即載入
export const fontNotoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
  weight: ['500', '600', '700'],
  preload: true, // 預載入
});

// https://fonts.google.com/noto/specimen/Noto+Sans+Mono
// 延遲載入等寬字體 - 按需載入
export const fontNotoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-mono',
  weight: ['400'],
  preload: false, // 不預載入，按需載入
});

// 移除未使用的字體以提升性能
// Noto Serif - 完全未使用，已移除
// Bricolage Grotesque - 只在未使用的組件中使用，已移除
