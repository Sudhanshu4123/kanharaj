import { topCities, otherCities, DELHI_FAMOUS_PLACES, NCR_CITIES, INDIAN_STATES } from './location-data'

function findMatchingLocation(term: string): string | null {
  const normalized = term.trim().toLowerCase().replace(/[-\s]+/g, ' ')
  if (!normalized) return null

  const checkList = [
    ...topCities,
    ...otherCities,
    ...DELHI_FAMOUS_PLACES,
    ...NCR_CITIES,
    ...INDIAN_STATES
  ]
  const matched = checkList.find(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === normalized)
  return matched || null
}

export function parseSearchInput(term: string, defaultCity: string = 'Delhi') {
  const trimmed = term.trim()
  if (!trimmed) {
    return { city: defaultCity, search: '' }
  }

  // Check if the entire string matches a known location
  const exactMatch = findMatchingLocation(trimmed)
  if (exactMatch) {
    return { city: exactMatch, search: '' }
  }

  // Check if it ends with a comma and a known location/city
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',')
    const lastPart = parts[parts.length - 1].trim()
    const matchedLast = findMatchingLocation(lastPart)
    if (matchedLast) {
      const searchPart = parts.slice(0, -1).join(',').trim()
      return { city: matchedLast, search: searchPart }
    }
  }

  // Check if it ends with a space and a known city/location
  const words = trimmed.split(/\s+/)
  if (words.length > 1) {
    // Check last word
    const lastWord = words[words.length - 1]
    const matchedLastWord = findMatchingLocation(lastWord)
    if (matchedLastWord) {
      const searchPart = words.slice(0, -1).join(' ').trim()
      return { city: matchedLastWord, search: searchPart }
    }
    // Check last two words (e.g. "Navi Mumbai" or "New Delhi")
    if (words.length > 2) {
      const lastTwoWords = words.slice(-2).join(' ')
      const matchedLastTwo = findMatchingLocation(lastTwoWords)
      if (matchedLastTwo) {
        const searchPart = words.slice(0, -2).join(' ').trim()
        return { city: matchedLastTwo, search: searchPart }
      }
    }
  }

  return { city: defaultCity, search: trimmed }
}

export function getRoutingUrl({
  listing,
  type,
  city,
  search,
  commercialMode,
  bhk,
  brokerage,
  status,
  condition,
}: {
  listing?: string
  type?: string
  city?: string
  search?: string
  commercialMode?: string
  bhk?: string
  brokerage?: string
  status?: string
  condition?: string
}) {
  const listingPart = (listing || 'buy').toLowerCase()
  let path = `/${listingPart}`

  if (type) {
    const t = type.toLowerCase()
    let typePart = t
    if (t.includes('flat') || t.includes('apartment')) {
      typePart = 'flat'
    } else if (t.includes('floor')) {
      typePart = 'floor'
    } else if (t.includes('villa')) {
      typePart = 'villa'
    } else if (t.includes('house')) {
      typePart = 'house'
    } else if (t.includes('plot') || t.includes('land')) {
      typePart = 'plot'
    } else if (t.includes('commercial')) {
      typePart = 'commercial'
    } else if (t.includes('pg')) {
      typePart = 'pg'
    }
    path += `/${typePart}`
  }

  if (city) {
    path += `/${city.toLowerCase().replace(/[-\s]+/g, '-')}`
  }

  const remainingParams = new URLSearchParams()
  if (search) remainingParams.set('search', search)
  if (commercialMode) remainingParams.set('commercial_mode', commercialMode)
  if (bhk) remainingParams.set('bhk', bhk)
  if (brokerage) remainingParams.set('brokerage', brokerage)
  if (status) remainingParams.set('status', status)
  if (condition) remainingParams.set('condition', condition)

  const qs = remainingParams.toString()
  return qs ? `${path}?${qs}` : path
}
