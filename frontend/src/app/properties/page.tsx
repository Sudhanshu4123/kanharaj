import type { Metadata } from "next"
import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata, buildFaqJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { INDIAN_STATES, DELHI_FAMOUS_PLACES, NCR_CITIES } from '@/lib/location-data'

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

function generateLocationFaqs(place: string, listing: string, type: string) {
  const isRent = listing.toLowerCase() === 'rent'
  const actionVerb = isRent ? 'rent' : 'buy'
  const actionText = isRent ? 'renting' : 'buying'
  const typeLabel = type ? type.toLowerCase().replace(/\+/g, ' ') : 'property'

  return [
    {
      question: `How can I ${actionVerb} a ${typeLabel} in ${place}?`,
      answer: `To ${actionVerb} a ${typeLabel} in ${place}, visit Kanharaj.com, filter listings by price, size, and layout, shortlist verified options, and contact us to schedule free guided site visits. We help you with site walkthroughs, builder direct deals, legal verification, and paperwork.`,
    },
    {
      question: `What are the zero brokerage options for ${typeLabel}s in ${place}?`,
      answer: `Kanharaj features direct listings from builders and owners in ${place} which have no brokerage charges. Filter listings using the 'Zero Brokerage' option to see verified properties where you pay zero commission.`,
    },
    {
      question: `Is it safe to invest in real estate in ${place}?`,
      answer: `Yes, ${place} is a growing hub with strong real estate potential. We recommend choosing verified, RERA-approved builder floors, apartments, or plots. Every listing on Kanharaj goes through primary documentation and site verification to protect your investment.`,
    },
    {
      question: `What paperwork is required to ${actionVerb} a property in ${place}?`,
      answer: `To ${actionVerb} a property, you typically need proof of identity/address (PAN, Aadhaar), income documents for home loans, and if ${isRent ? 'renting, a standard Rent Agreement' : 'buying, the Sale Agreement, Title Deed copy, and Registry documents'}. Kanharaj provides complete legal assistance for documentation.`,
    }
  ]
}

export default function PropertiesPage({ searchParams }: Props) {
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

  const locationFaqs = generateLocationFaqs(place, listing, type)

  return (
    <>
      <JsonLd data={buildFaqJsonLd(locationFaqs)} />
      <Suspense fallback={<PropertiesPageSkeleton />}>
        <PropertiesContent />
      </Suspense>
    </>
  )
}
