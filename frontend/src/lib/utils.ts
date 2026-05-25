import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Cache-busted brand logo path (update version when logo file changes). */
export const BRAND_LOGO_SRC = '/logo.png?v=3'

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function tryParse(str: string, fallback: any = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/** True when user is logged in and has an active seller subscription (or is admin). */
export function hasSellerDashboardAccess(user: User | null | undefined): boolean {
  if (!user) return false

  const role = String(user.role || '').toUpperCase()
  if (role === 'ADMIN') return true

  const plan = String(user.subscriptionPlan || '').toUpperCase()
  if (!plan || plan === 'NONE') return false

  if (user.subscriptionExpiry) {
    const expiry = new Date(user.subscriptionExpiry)
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) return false
  }

  return role === 'SELLER'
}