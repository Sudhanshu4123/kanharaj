/** Real-data helpers for Kanharaj seller dashboard */
import { getApiUrl } from "./auth"

export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '9599801767'
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'kanharaj1389@gmail.com'

export type SellerProperty = {
  id: number | string
  title?: string
  description?: string
  price?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  images?: string[]
  status?: string
  featured?: boolean
  views?: number
  inquiryCount?: number
  lqs?: number
  propertyType?: string
  listingType?: string
  address?: string
  city?: string
  location?: string
  createdAt?: string
  updatedAt?: string
  purpose?: string
}

export type SellerLead = {
  id: number
  propertyId?: number | null
  propertyTitle?: string
  propertyLocation?: string
  propertyType?: string
  listingType?: string
  price?: number
  area?: number
  bedrooms?: number
  name?: string
  email?: string
  phone?: string
  message?: string
  status?: string
  createdAt?: string
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'

export function normalizeImageUrl(img: string): string {
  if (!img) return FALLBACK_IMAGE
  if (img.startsWith('http')) return img
  // If img is already relative (e.g. /api/uploads/...) keep it as-is;
  // Next.js proxy will route it to the backend.
  const apiBase = getApiUrl()
  if (!apiBase || !apiBase.startsWith('http')) return img
  const origin = apiBase.replace(/\/api$/, '')
  return `${origin}${img.startsWith('/') ? '' : '/'}${img}`
}

export function normalizeSellerProperty(raw: Record<string, unknown>): SellerProperty {
  const images = Array.isArray(raw.images)
    ? (raw.images as string[]).map(normalizeImageUrl).filter(Boolean)
    : []
  const prop: SellerProperty = {
    ...(raw as SellerProperty),
    id: raw.id as number | string,
    images,
    price: typeof raw.price === 'object' ? Number(raw.price) : Number(raw.price) || 0,
    status: String(raw.status || 'INACTIVE').toUpperCase(),
    location: [raw.address, raw.city].filter(Boolean).join(', ') || String(raw.location || ''),
    lqs: computeListingQualityScore({ ...raw, images } as SellerProperty),
  }
  return prop
}

/** Listing Quality Score 1–10 from real listing completeness */
export function computeListingQualityScore(prop: SellerProperty): number {
  let score = 2
  const imgCount = prop.images?.length ?? 0
  if (imgCount >= 5) score += 3
  else if (imgCount >= 3) score += 2
  else if (imgCount >= 1) score += 1

  const descLen = (prop.description || '').trim().length
  if (descLen >= 200) score += 2
  else if (descLen >= 80) score += 1

  if ((prop.title || '').trim().length >= 12) score += 0.5
  if (prop.price && prop.price > 0) score += 1
  if (prop.area && prop.area > 0) score += 0.5
  if (prop.bedrooms && prop.bedrooms > 0) score += 0.5
  if (prop.featured) score += 0.5

  return Math.min(10, Math.round(score * 10) / 10)
}

export function averageLqs(properties: SellerProperty[]): number {
  if (properties.length === 0) return 0
  const sum = properties.reduce((a, p) => a + (p.lqs ?? computeListingQualityScore(p)), 0)
  return Math.round((sum / properties.length) * 10) / 10
}

export function attachInquiryCounts(
  properties: SellerProperty[],
  leads: SellerLead[]
): SellerProperty[] {
  const counts = new Map<string, number>()
  for (const lead of leads) {
    if (lead.propertyId == null) continue
    const key = String(lead.propertyId)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return properties.map((p) => ({
    ...p,
    inquiryCount: counts.get(String(p.id)) ?? 0,
  }))
}

export function countInquiriesByPeriod(
  leads: SellerLead[],
  period: 'Last Week' | 'Last Month' | 'Last 3 Months' | 'All'
): SellerLead[] {
  if (period === 'All') return leads
  const now = Date.now()
  const days = period === 'Last Week' ? 7 : period === 'Last Month' ? 30 : 90
  const cutoff = now - days * 24 * 60 * 60 * 1000
  return leads.filter((l) => {
    if (!l.createdAt) return false
    return new Date(l.createdAt).getTime() >= cutoff
  })
}

export function leadsToday(leads: SellerLead[]): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return leads.filter((l) => l.createdAt && new Date(l.createdAt) >= start).length
}

export function mapInquiryStatusToLabel(status?: string): string {
  const s = (status || 'PENDING').toUpperCase()
  if (s === 'CONTACTED') return 'Replied'
  if (s === 'RESOLVED') return 'Closed'
  if (s === 'PENDING') return 'New'
  return status || 'New'
}

export function mapLabelToInquiryStatus(label: string): 'PENDING' | 'CONTACTED' | 'RESOLVED' {
  const l = label.toLowerCase()
  if (l === 'replied' || l === 'contacted') return 'CONTACTED'
  if (l === 'closed' || l === 'resolved') return 'RESOLVED'
  return 'PENDING'
}

export function formatPlanBadge(plan?: string): string {
  if (!plan || plan === 'NONE') return 'No Plan'
  const p = plan.toUpperCase()
  if (p === 'SUPER' || p.includes('ENTERPRISE')) return 'Super Enterprise'
  if (p === 'PREMIUM' || p.includes('PRO')) return 'Premium Pro'
  if (p === 'BASIC') return 'Basic Plan'
  return plan.replace(/_/g, ' ')
}

export function planListingLimit(plan?: string): number {
  if (!plan || plan === 'NONE') return 0
  return 999
}

export function isCommercialProperty(prop: SellerProperty): boolean {
  const t = (prop.propertyType || '').toUpperCase()
  return t.includes('COMMERCIAL') || t.includes('OFFICE') || t.includes('SHOP')
}

export function computeConversionRate(leads: number, views: number, listings: number): string {
  if (views > 0) return `${((leads / views) * 100).toFixed(1)}%`
  if (listings > 0 && leads > 0) return `${((leads / listings) * 100).toFixed(1)}%`
  return '0%'
}

export async function fetchSellerPaymentStatus(token: string) {
  const res = await fetch(`${getApiUrl()}/payments/status`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchMyProperties(token: string): Promise<SellerProperty[]> {
  const res = await fetch(`${getApiUrl()}/properties/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return (Array.isArray(data) ? data : []).map((p: Record<string, unknown>) =>
    normalizeSellerProperty(p)
  )
}

export async function fetchSellerLeads(token: string, sellerId: number | string): Promise<SellerLead[]> {
  const res = await fetch(
    `${getApiUrl()}/inquiries/seller`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
