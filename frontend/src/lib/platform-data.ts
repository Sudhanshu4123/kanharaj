import { API_URL } from './store'
import { Property } from './data'
import { formatPrice, formatNumber, getApiUrl } from './utils'

export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '9599801767'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'

export type PlatformStats = {
  properties: number
  buyers: number
  sellers: number
  cities: number
  verifiedPercent: number
}

export type TestimonialItem = {
  id: string
  name: string
  location: string
  rating: number
  text: string
  avatar: string
}

export function getPropertyImageUrl(property: Property): string {
  const img = property.images?.[0]
  if (!img) return FALLBACK_IMAGE
  if (img.startsWith('http')) return img
  const apiBase = (getApiUrl() || '/api').replace(/\/api$/, '')
  return `${apiBase}${img.startsWith('/') ? '' : '/'}${img}`
}

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} mins ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return days === 1 ? '1 day ago' : `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function formatStatCount(n: number, suffix = '+'): string {
  if (n <= 0) return '0'
  return `${formatNumber(n)}${suffix}`
}

export async function fetchPlatformStats(): Promise<PlatformStats | null> {
  try {
    const res = await fetch(`${API_URL}/properties/stats`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return {
      properties: Number(data.properties) || 0,
      buyers: Number(data.buyers) || 0,
      sellers: Number(data.sellers) || 0,
      cities: Number(data.cities) || 0,
      verifiedPercent: Number(data.verifiedPercent) || 100,
    }
  } catch {
    return null
  }
}

export async function fetchPublishedTestimonials(limit = 6): Promise<TestimonialItem[]> {
  try {
    const res = await fetch(`${API_URL}/feedbacks/public`, { cache: 'no-store' })
    if (!res.ok) return []
    const list = await res.json()
    if (!Array.isArray(list)) return []
    return list
      .filter((f: { rating?: number; comment?: string }) => (f.rating ?? 0) >= 4 && f.comment?.trim())
      .sort(
        (a: { createdAt?: string }, b: { createdAt?: string }) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      .slice(0, limit)
      .map((f: { id?: number; name?: string; email?: string; rating?: number; comment?: string; category?: string }) => ({
        id: String(f.id),
        name: f.name || 'Kanharaj User',
        location: f.category || 'Dwarka, Delhi',
        rating: Math.min(5, Math.max(1, f.rating ?? 5)),
        text: f.comment || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name || 'User')}&background=6B46C1&color=fff&size=128`,
      }))
  } catch {
    return []
  }
}

export function getActiveProperties(properties: Property[]): Property[] {
  return properties.filter((p) => p.status === 'ACTIVE')
}

export function getFeaturedOrLatest(properties: Property[], limit = 3): Property[] {
  const active = getActiveProperties(properties)
  const featured = active.filter((p) => p.featured)
  const pool = featured.length > 0 ? featured : [...active].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
  return pool.slice(0, limit)
}

export function getProjectProperties(properties: Property[], limit = 3): Property[] {
  const active = getActiveProperties(properties)
  const projects = active.filter((p) => {
    const t = (p.propertyType || '').toUpperCase()
    return t.includes('PROJECT') || t === 'RESIDENTIAL PROJECT'
  })
  const pool = projects.length > 0
    ? projects
    : active.filter((p) => p.featured)
  return [...pool]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, limit)
}

export function getNewlyAdded(properties: Property[], limit = 3): Property[] {
  return [...getActiveProperties(properties)]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, limit)
}

export type CityCount = { name: string; count: number; image: string }

const CITY_IMAGES: Record<string, string> = {
  dwarka: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400',
  delhi: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400',
  gurgaon: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400',
  gurugram: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400',
  noida: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400',
}

export function getPopularCities(properties: Property[], limit = 4): CityCount[] {
  const counts = new Map<string, { count: number; image: string }>()
  for (const p of getActiveProperties(properties)) {
    const city = (p.city || 'Dwarka').trim()
    if (!city) continue
    const key = city.toLowerCase()
    const existing = counts.get(key)
    const img = getPropertyImageUrl(p)
    if (!existing) {
      counts.set(key, {
        count: 1,
        image: CITY_IMAGES[key] || (img !== FALLBACK_IMAGE ? img : CITY_IMAGES.dwarka),
      })
    } else {
      existing.count += 1
    }
  }
  return Array.from(counts.entries())
    .map(([key, v]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: v.count,
      image: v.image,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export type SellerPartner = {
  id: string
  name: string
  phone: string
  address: string
  listingCount: number
}

export function getSellerPartners(properties: Property[], limit = 3): SellerPartner[] {
  const map = new Map<string, SellerPartner>()
  for (const p of getActiveProperties(properties)) {
    if (!p.user?.name && !(p as Property & { userName?: string }).userName) continue
    const uid = String(p.userId || p.user?.id || p.user?.name)
    const name = p.user?.name || (p as Property & { userName?: string }).userName || 'Seller'
    const phone = p.user?.phone || ''
    const existing = map.get(uid)
    if (!existing) {
      map.set(uid, {
        id: uid,
        name,
        phone,
        address: [p.address, p.city].filter(Boolean).join(', '),
        listingCount: 1,
      })
    } else {
      existing.listingCount += 1
      if (!existing.phone && phone) existing.phone = phone
    }
  }
  return Array.from(map.values())
    .filter((s) => s.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, limit)
}

export function countByBedrooms(properties: Property[], bedrooms: number): number {
  return getActiveProperties(properties).filter((p) => p.bedrooms === bedrooms).length
}

export function countByListingType(properties: Property[], type: 'BUY' | 'RENT'): number {
  return getActiveProperties(properties).filter((p) => p.listingType === type).length
}

export function formatPropertyPriceDisplay(property: Property): string {
  const priceVal = typeof property.price === 'number' ? property.price : Number(property.price) || 0
  const formatted = formatPrice(priceVal)
  if (property.listingType === 'RENT') {
    return `${formatted}/month`
  }
  return formatted
}

export function formatAreaDisplay(area?: number): string {
  if (!area || area <= 0) return '—'
  return `${formatNumber(area)} Sq.Ft`
}

export function formatBedBath(property: Property): { beds: string; baths: string } {
  return {
    beds: property.bedrooms > 0 ? `${property.bedrooms} BHK` : '—',
    baths: property.bathrooms > 0 ? String(property.bathrooms) : '—',
  }
}
