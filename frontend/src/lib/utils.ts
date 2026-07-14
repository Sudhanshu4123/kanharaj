import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Cache-busted brand logo path (update version when logo file changes). */
export const BRAND_LOGO_SRC = '/logo.png?v=3'

export function formatPrice(price: number): string {
  if (price === 0) return '₹0'
  if (!price) return 'N/A'

  if (price >= 10000000) {
    const val = price / 10000000
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)} Cr`
  }
  if (price >= 100000) {
    const val = price / 100000
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)} Lakh`
  }
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

/** Resolves Seller Dashboard URL dynamically to prevent hardcoded localhost/dev issues in production. */
export function getSellerUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'kanharaj.com' || hostname === 'www.kanharaj.com') {
      return 'https://seller.kanharaj.com';
    }
    return `${protocol}//${hostname}:3001`;
  }
  return (process.env.NEXT_PUBLIC_SELLER_URL && process.env.NEXT_PUBLIC_SELLER_URL !== 'undefined')
    ? process.env.NEXT_PUBLIC_SELLER_URL
    : 'https://seller.kanharaj.com';
}

/** Resolves Backend API URL dynamically to prevent hardcoded localhost/dev issues in production. */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
      return 'https://kanharaj.com/api';
    }
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
}

export function getPropertyUrl(property: any): string {
  if (!property) return '#'
  const isProject = property.propertyType?.toUpperCase() === 'RESIDENTIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL_PROJECT' ||
                    property.propertyType?.toUpperCase() === 'RESIDENTIAL PROJECT' ||
                    property.propertyType?.toUpperCase() === 'COMMERCIAL PROJECT';
  return isProject ? `/project/${property.id}` : `/property/${property.id}`;
}