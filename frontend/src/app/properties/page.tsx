import type { Metadata } from "next"
import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata } from '@/lib/seo'
import { INDIAN_STATES, DELHI_FAMOUS_PLACES } from '@/lib/location-data'

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
  const isIndianState = INDIAN_STATES.some(s => s.toLowerCase() === place.toLowerCase())

  if (isDelhiPlace) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place}, Delhi | Premium Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place}, Delhi | Kanharaj`
    description = `Looking for ${typeLabel.toLowerCase()} in ${place}, Delhi? Discover verified properties, flats, luxury apartments, and builder floors for ${listing === 'rent' ? 'rent' : 'sale'} with zero brokerage options on Kanharaj.`
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

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesPageSkeleton />}>
      <PropertiesContent />
    </Suspense>
  )
}
