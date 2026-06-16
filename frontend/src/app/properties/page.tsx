import type { Metadata } from "next"
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata, buildFaqJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { INDIAN_STATES, DELHI_FAMOUS_PLACES, NCR_CITIES } from '@/lib/location-data'
import { PropertiesListContainer } from './PropertiesListContainer'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const state = typeof searchParams.state === 'string' ? searchParams.state : ''
  const listing = typeof searchParams.listing === 'string' ? searchParams.listing : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  let place = 'All India'
  if (city && state) {
    place = `${city}, ${state}`
  } else {
    place = city || state || search || 'All India'
  }
  
  let listingLabel = 'Properties'
  if (listing.toLowerCase() === 'rent') {
    listingLabel = 'Properties for Rent'
  } else if (listing.toLowerCase() === 'buy') {
    listingLabel = 'Properties for Sale'
  }

  let typeLabel = 'Properties'
  if (type) {
    typeLabel = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + 's'
  }

  let title = ''
  let description = ''
  
  const isDelhiPlace = DELHI_FAMOUS_PLACES.some(p => p.toLowerCase() === place.toLowerCase())
  const isNcrCity = NCR_CITIES.some(c => c.toLowerCase() === place.toLowerCase())
  const isIndianState = INDIAN_STATES.some(s => s.toLowerCase() === place.toLowerCase())

  if (isDelhiPlace) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place}, Delhi | Premium Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place}, Delhi | Kanharaj`
    description = `Looking for ${typeLabel.toLowerCase()} in ${place}, Delhi? Discover verified properties, flats, luxury apartments, and builder floors for ${listing === 'rent' ? 'rent' : 'sale'} with zero brokerage options on Kanharaj.`
  } else if (isNcrCity) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place}, Delhi NCR | Verified Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place}, Delhi NCR | Kanharaj`
    description = `Searching for ${typeLabel.toLowerCase()} in ${place}, Delhi NCR? Explore verified properties, flats, builder floors, plots & villas for ${listing === 'rent' ? 'rent' : 'sale'} with zero brokerage on Kanharaj.`
  } else if (isIndianState) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place} | Real Estate Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place} | Kanharaj`
    description = `Explore properties in ${place}. Find flats, apartments, house plots, and villas for ${listing === 'rent' ? 'rent' : 'sale'} across all major cities of ${place} with expert agent guidance on Kanharaj.`
  } else {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place} | Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place} | Kanharaj`
    description = `Find the best ${typeLabel.toLowerCase()} for ${listing === 'rent' ? 'rent' : 'sale'} in ${place}. Explore verified listings, builder floors, flats & villas with zero brokerage options on Kanharaj.`
  }

  const keywords = [
    `properties in ${place}`,
    `flats for sale in ${place}`,
    `rent flat in ${place}`,
    `builder floor ${place}`,
    `real estate agent ${place}`,
    `kanharaj ${place}`
  ]

  let canonicalPath = '/properties'
  const pathParams = new URLSearchParams()
  if (city) pathParams.set('city', city)
  if (state) pathParams.set('state', state)
  if (listing) pathParams.set('listing', listing)
  if (type) pathParams.set('type', type)
  if (search) pathParams.set('search', search)
  const qs = pathParams.toString()
  if (qs) canonicalPath += `?${qs}`

  return buildPageMetadata({
    title,
    description,
    path: canonicalPath,
    keywords,
  })
}



export default function PropertiesPage({ searchParams }: Props) {
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const listing = typeof searchParams.listing === 'string' ? searchParams.listing : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''

  if (listing && (listing.toLowerCase() === 'buy' || listing.toLowerCase() === 'rent')) {
    const listingPart = listing.toLowerCase()
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
      }
      path += `/${typePart}`
    }

    if (city) {
      path += `/${city.toLowerCase().replace(/\s+/g, '-')}`
    }

    const remainingParams = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key !== 'listing' && key !== 'type' && key !== 'city') {
        if (typeof val === 'string') {
          remainingParams.set(key, val)
        } else if (Array.isArray(val)) {
          val.forEach(v => remainingParams.append(key, v))
        }
      }
    })

    const qs = remainingParams.toString()
    const finalUrl = qs ? `${path}?${qs}` : path
    
    redirect(finalUrl)
  }

  return <PropertiesListContainer searchParams={searchParams} />
}
