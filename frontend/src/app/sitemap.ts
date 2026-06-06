import { MetadataRoute } from 'next'
import { SITE, absoluteUrl } from '@/lib/seo'
import { INDIAN_STATES, DELHI_FAMOUS_PLACES } from '@/lib/location-data'

export const revalidate = 3600

const HIGHLIGHT_CITIES = [
  'Gurugram',
  'Noida',
  'Greater Noida',
  'Faridabad',
  'Ghaziabad',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Lucknow',
  'Chandigarh'
]

const ALL_CITIES = Array.from(new Set([...DELHI_FAMOUS_PLACES, ...HIGHLIGHT_CITIES]))

function getPropertiesApiUrl(): string {
  const base =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://kanharaj.com/api'
  if (base.includes('/properties')) return base.replace(/\/properties.*$/, '/properties')
  const root = base.replace(/\/api\/?$/, '')
  return `${root}/api/properties`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/properties'), lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: absoluteUrl('/properties?listing=buy'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/properties?listing=rent'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/properties?type=flat&listing=buy'), lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: absoluteUrl('/properties?type=house&listing=buy'), lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: absoluteUrl('/properties?brokerage=zero&listing=buy'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/for-sellers'), lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: absoluteUrl('/feedback'), lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: absoluteUrl('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const placeRoutes: MetadataRoute.Sitemap = []
  
  // Localities & Cities Buy/Rent Routes
  ALL_CITIES.forEach((place) => {
    placeRoutes.push({
      url: absoluteUrl(`/properties?city=${encodeURIComponent(place)}&listing=buy`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    })
    placeRoutes.push({
      url: absoluteUrl(`/properties?city=${encodeURIComponent(place)}&listing=rent`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    })
  })

  // Indian States Buy/Rent Routes
  INDIAN_STATES.forEach((state) => {
    placeRoutes.push({
      url: absoluteUrl(`/properties?state=${encodeURIComponent(state)}&listing=buy`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    })
    placeRoutes.push({
      url: absoluteUrl(`/properties?state=${encodeURIComponent(state)}&listing=rent`),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  let routes: MetadataRoute.Sitemap = []

  try {
    const fetchUrl = `${getPropertiesApiUrl()}?size=500`
    const response = await fetch(fetchUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) {
      routes = [...staticRoutes, ...placeRoutes]
    } else {
      const data = await response.json()
      const content = data?.content ?? (Array.isArray(data) ? data : [])
      if (!Array.isArray(content)) {
        routes = [...staticRoutes, ...placeRoutes]
      } else {
        const propertyRoutes: MetadataRoute.Sitemap = content
          .filter((prop: { id?: number | string }) => prop?.id != null)
          .map((prop: { id: number | string; updatedAt?: string }) => ({
            url: absoluteUrl(`/property/${prop.id}`),
            lastModified: prop.updatedAt ? new Date(prop.updatedAt) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.65,
          }))

        routes = [...staticRoutes, ...placeRoutes, ...propertyRoutes]
      }
    }
  } catch (error) {
    console.error('Sitemap: property fetch failed, serving static routes only:', error)
    routes = [...staticRoutes, ...placeRoutes]
  }

  // XML requires ampersands in URLs to be escaped as &amp;
  return routes.map((route) => ({
    ...route,
    url: route.url.replace(/&(?!amp;)/g, '&amp;'),
  }))
}
