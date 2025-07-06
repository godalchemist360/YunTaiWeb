import { websiteConfig } from '@/config/website';
import type { CreditPackage } from './types';

/**
 * Get all credit packages, used in server components
 * @returns Credit packages
 */
export function getAllCreditPackagesInServer(): CreditPackage[] {
  return Object.values(websiteConfig.credits.packages);
}

/**
 * Get credit package by id, used in server components
 * @param id - Credit package id
 * @returns Credit package
 */
export function getCreditPackageByIdInServer(
  id: string
): CreditPackage | undefined {
  return websiteConfig.credits.packages[
    id as keyof typeof websiteConfig.credits.packages
  ];
}
