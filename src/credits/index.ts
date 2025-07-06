import { websiteConfig } from '@/config/website';

/**
 * Get credit packages
 * @returns Credit packages
 */
export function getCreditPackages() {
  return Object.values(websiteConfig.credits.packages);
}

/**
 * Get credit package by id
 * @param id - Credit package id
 * @returns Credit package
 */
export function getCreditPackageById(id: string) {
  return getCreditPackages().find((pkg) => pkg.id === id);
}
