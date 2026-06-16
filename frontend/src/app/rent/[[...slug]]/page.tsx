import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { generateMetadata as baseGenerateMetadata } from '../../properties/page'
import { PropertiesListContainer } from '../../properties/PropertiesListContainer'
import { topCities, otherCities, DELHI_FAMOUS_PLACES, NCR_CITIES, INDIAN_STATES } from '@/lib/location-data'

function isValidLocation(loc: string): boolean {
  const normalized = loc.toLowerCase().replace(/[-\s]+/g, ' ')
  const checkList = [
    ...topCities,
    ...otherCities,
    ...DELHI_FAMOUS_PLACES,
    ...NCR_CITIES,
    ...INDIAN_STATES
  ]
  return checkList.some(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === normalized)
}

// Helper function to check valid types
function isValidType(t: string): boolean {
  const normalized = t.toLowerCase()
  const knownTypes = ['flat', 'apartment', 'house', 'villa', 'floor', 'plot', 'land', 'commercial', 'studio', 'penthouse', 'duplex', 'project', 'pg']
  return knownTypes.some(kt => normalized.includes(kt))
}

// Helper to extract parameters from slug
function parseSlugParams(slug?: string[]) {
  let type = ''
  let city = ''

  if (slug && slug.length > 0) {
    if (slug.length > 2) {
      notFound()
    }

    const firstSlug = decodeURIComponent(slug[0]).toLowerCase()
    const isFirstSlugType = isValidType(firstSlug)
    const isFirstSlugLocation = isValidLocation(firstSlug)

    if (!isFirstSlugType && !isFirstSlugLocation) {
      notFound()
    }

    if (slug.length === 2) {
      const secondSlug = decodeURIComponent(slug[1]).toLowerCase()
      const isSecondSlugLocation = isValidLocation(secondSlug)
      if (!isFirstSlugType || !isSecondSlugLocation) {
        notFound()
      }
      
      if (firstSlug.includes('flat') || firstSlug.includes('apartment')) {
        type = 'flat'
      } else if (firstSlug.includes('villa')) {
        type = 'villa'
      } else if (firstSlug.includes('house')) {
        type = 'house'
      } else if (firstSlug.includes('plot') || firstSlug.includes('land')) {
        type = 'plots/land'
      } else if (firstSlug.includes('floor')) {
        type = 'builder floor'
      } else if (firstSlug.includes('project')) {
        type = 'residential project'
      } else if (firstSlug.includes('pg')) {
        type = 'pg'
      } else {
        type = firstSlug
      }

      city = decodeURIComponent(slug[1])
    } else {
      // slug.length === 1
      if (isFirstSlugType) {
        if (firstSlug.includes('flat') || firstSlug.includes('apartment')) {
          type = 'flat'
        } else if (firstSlug.includes('villa')) {
          type = 'villa'
        } else if (firstSlug.includes('house')) {
          type = 'house'
        } else if (firstSlug.includes('plot') || firstSlug.includes('land')) {
          type = 'plots/land'
        } else if (firstSlug.includes('floor')) {
          type = 'builder floor'
        } else if (firstSlug.includes('project')) {
          type = 'residential project'
        } else if (firstSlug.includes('pg')) {
          type = 'pg'
        } else {
          type = firstSlug
        }
      } else {
        city = decodeURIComponent(slug[0])
      }
    }
  }

  if (city) {
    const searchCity = city.toLowerCase().replace(/[-\s]+/g, ' ')
    const matchedTop = topCities.find(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === searchCity)
    const matchedOther = otherCities.find(c => c.toLowerCase().replace(/[-\s]+/g, ' ') === searchCity)
    city = matchedTop || matchedOther || (city.charAt(0).toUpperCase() + city.slice(1))
  }

  return {
    listing: 'rent',
    type,
    city
  }
}

type PageProps = {
  params: {
    slug?: string[]
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const parsed = parseSlugParams(params.slug)

  const mergedSearchParams = {
    ...searchParams,
    listing: parsed.listing,
    ...(parsed.type ? { type: parsed.type } : {}),
    ...(parsed.city ? { city: parsed.city } : {})
  }

  return baseGenerateMetadata({ searchParams: mergedSearchParams })
}

export default function RentPropertiesPage({ params, searchParams }: PageProps) {
  const parsed = parseSlugParams(params.slug)

  const mergedSearchParams = {
    ...searchParams,
    listing: parsed.listing,
    ...(parsed.type ? { type: parsed.type } : {}),
    ...(parsed.city ? { city: parsed.city } : {})
  }

  return <PropertiesListContainer searchParams={mergedSearchParams} />
}
