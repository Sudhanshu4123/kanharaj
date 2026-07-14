import { Property } from './data'

export type NearbyPlace = {
  id: string
  label: string
  name: string
  distanceKm: number
  icon: 'metro' | 'school' | 'hospital' | 'shopping'
}

const DWARKA_CENTER = { lat: 28.5921, lng: 77.0266 }

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} Km`
}

export function computeProximityScore(places: NearbyPlace[]): number {
  if (places.length === 0) return 7.5
  const avg = places.reduce((s, p) => s + p.distanceKm, 0) / places.length
  return Math.round(Math.min(9.8, Math.max(6.5, 10 - avg * 1.15)) * 10) / 10
}

export function buildMapEmbedUrl(lat: number, lng: number, query?: string): string {
  const isFallback = Math.abs(lat - DWARKA_CENTER.lat) < 0.0001 && Math.abs(lng - DWARKA_CENTER.lng) < 0.0001
  if (isFallback && query) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=15&output=embed`
  }
  return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`
}

export function buildGoogleMapsUrl(lat: number, lng: number, label: string): string {
  const isFallback = Math.abs(lat - DWARKA_CENTER.lat) < 0.0001 && Math.abs(lng - DWARKA_CENTER.lng) < 0.0001
  if (isFallback) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`
}

function buildGeocodeQuery(property: Property): string {
  return [property.address, property.city, property.state, property.pincode, 'India']
    .filter((p) => p && String(p).trim())
    .join(', ')
}

export async function geocodeProperty(property: Property): Promise<{ lat: number; lng: number; displayName: string }> {
  // 1. Check verified coordinates first
  const vLat = Number(property.verificationLatitude)
  const vLng = Number(property.verificationLongitude)
  if (property.verified && Number.isFinite(vLat) && Number.isFinite(vLng) && vLat !== 0 && vLng !== 0) {
    return {
      lat: vLat,
      lng: vLng,
      displayName: [property.address, property.city].filter(Boolean).join(', '),
    }
  }

  // 2. Check standard coordinates
  const lat = Number(property.latitude)
  const lng = Number(property.longitude)
  if (Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0) {
    return {
      lat,
      lng,
      displayName: [property.address, property.city].filter(Boolean).join(', '),
    }
  }

  const query = buildGeocodeQuery(property)
  if (!query) {
    return { 
      ...DWARKA_CENTER, 
      displayName: [property.address, property.city].filter(Boolean).join(', ') || 'Dwarka, New Delhi' 
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Property-App/1.0' } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.[0]?.lat && data?.[0]?.lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name?.split(',').slice(0, 3).join(', ') || query,
        }
      }
    }
  } catch {
    /* fall through */
  }

  // Try broader geocoding fallback
  try {
    const broadQuery = `${property.city}, ${property.state}, India`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(broadQuery)}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'Kanharaj-Property-App/1.0' } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.[0]?.lat && data?.[0]?.lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: [property.address, property.city].filter(Boolean).join(', ') || broadQuery,
        }
      }
    }
  } catch {
    /* fall through */
  }

  return { 
    ...DWARKA_CENTER, 
    displayName: [property.address, property.city].filter(Boolean).join(', ') || 'Dwarka, New Delhi' 
  }
}

type OsmElement = {
  type: string
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

function elementCoords(el: OsmElement): { lat: number; lon: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon }
  if (el.center?.lat != null && el.center?.lon != null) return { lat: el.center.lat, lon: el.center.lon }
  return null
}

function classifyElement(el: OsmElement): NearbyPlace['icon'] | null {
  const t = el.tags || {}
  if (t.railway === 'station' || t.station === 'subway' || t.public_transport === 'station') return 'metro'
  if (t.amenity === 'school' || t.amenity === 'college' || t.amenity === 'university') return 'school'
  if (t.amenity === 'hospital' || t.amenity === 'clinic') return 'hospital'
  if (t.shop === 'mall' || t.shop === 'supermarket' || t.amenity === 'marketplace') return 'shopping'
  return null
}

const CATEGORY_LABELS: Record<NearbyPlace['icon'], string> = {
  metro: 'Metro / Sub Station',
  school: 'Public Schools',
  hospital: 'Multi Specialty Hospital',
  shopping: 'City Shopping Plaza',
}

function pickNearestByCategory(
  elements: OsmElement[],
  originLat: number,
  originLng: number
): NearbyPlace[] {
  const best: Partial<Record<NearbyPlace['icon'], NearbyPlace>> = {}

  for (const el of elements) {
    const kind = classifyElement(el)
    if (!kind) continue
    const coords = elementCoords(el)
    if (!coords) continue
    const distanceKm = haversineKm(originLat, originLng, coords.lat, coords.lon)
    const name = el.tags?.name || CATEGORY_LABELS[kind]
    const existing = best[kind]
    if (!existing || distanceKm < existing.distanceKm) {
      best[kind] = {
        id: `${kind}-${el.type}-${name}`,
        label: CATEGORY_LABELS[kind],
        name,
        distanceKm,
        icon: kind,
      }
    }
  }

  const order: NearbyPlace['icon'][] = ['metro', 'school', 'hospital', 'shopping']
  return order.map((k) => best[k]).filter((p): p is NearbyPlace => !!p)
}

const DWARKA_FALLBACK: NearbyPlace[] = [
  { id: 'fb-metro', label: 'Metro / Sub Station', name: 'Dwarka Metro corridor', distanceKm: 0.9, icon: 'metro' },
  { id: 'fb-school', label: 'Public Schools', name: 'Sector schools cluster', distanceKm: 1.1, icon: 'school' },
  { id: 'fb-hospital', label: 'Multi Specialty Hospital', name: 'Dwarka hospitals', distanceKm: 1.6, icon: 'hospital' },
  { id: 'fb-shop', label: 'City Shopping Plaza', name: 'Vegas Mall / City Centre', distanceKm: 2.0, icon: 'shopping' },
]

export function getDynamicFallback(property: Property): NearbyPlace[] {
  const prefix = property.address?.split(',')[0]?.trim() || property.city || 'Local'
  return [
    { id: 'fb-metro', label: 'Metro / Sub Station', name: `${prefix} transit corridor`, distanceKm: 1.2, icon: 'metro' },
    { id: 'fb-school', label: 'Public Schools', name: `${prefix} area school cluster`, distanceKm: 1.5, icon: 'school' },
    { id: 'fb-hospital', label: 'Multi Specialty Hospital', name: `${prefix} local hospitals`, distanceKm: 2.1, icon: 'hospital' },
    { id: 'fb-shop', label: 'City Shopping Plaza', name: `${prefix} market zone`, distanceKm: 2.5, icon: 'shopping' },
  ]
}

export async function fetchNearbyPlaces(lat: number, lng: number, property?: Property): Promise<NearbyPlace[]> {
  const radius = 5000
  const query = `
[out:json][timeout:20];
(
  node["railway"="station"](around:${radius},${lat},${lng});
  node["station"="subway"](around:${radius},${lat},${lng});
  node["public_transport"="station"](around:${radius},${lat},${lng});
  node["amenity"="school"](around:${radius},${lat},${lng});
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  node["amenity"="clinic"](around:${radius},${lat},${lng});
  node["shop"="mall"](around:${radius},${lat},${lng});
  node["shop"="supermarket"](around:${radius},${lat},${lng});
  node["amenity"="marketplace"](around:${radius},${lat},${lng});
  way["amenity"="school"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
);
out center;
`

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    if (!res.ok) throw new Error('Overpass failed')
    const json = await res.json()
    const places = pickNearestByCategory(json.elements || [], lat, lng)
    if (places.length >= 2) return places
  } catch {
    /* fallback */
  }

  return property ? getDynamicFallback(property) : DWARKA_FALLBACK
}

export async function fetchLocalityData(property: Property) {
  const coords = await geocodeProperty(property)
  const nearby = await fetchNearbyPlaces(coords.lat, coords.lng, property)
  const query = buildGeocodeQuery(property)
  return {
    ...coords,
    nearby,
    proximityScore: computeProximityScore(nearby),
    mapEmbedUrl: buildMapEmbedUrl(coords.lat, coords.lng, query || coords.displayName),
    googleMapsUrl: buildGoogleMapsUrl(coords.lat, coords.lng, coords.displayName),
  }
}
