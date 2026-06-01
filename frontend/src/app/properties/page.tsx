import type { Metadata } from "next"
import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata } from '@/lib/seo'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const listing = typeof searchParams.listing === 'string' ? searchParams.listing : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  let place = city || search || 'All India'
  
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

  const title = typeLabel === 'Properties'
    ? `${listingLabel} in ${place} | Kanharaj`
    : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place} | Kanharaj`

  const description = `Find the best ${typeLabel.toLowerCase()} for ${listing === 'rent' ? 'rent' : 'sale'} in ${place}. Explore verified listings, builder floors, flats & villas with zero brokerage options on Kanharaj.`

  const keywords = [
    `properties in ${place}`,
    `flats for sale in ${place}`,
    `rent flat in ${place}`,
    `builder floor ${place}`,
    `real estate agent ${place}`,
    `kanharaj ${place}`
  ]

  return buildPageMetadata({
    title,
    description,
    path: `/properties${city ? `?city=${encodeURIComponent(city)}` : ''}`,
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
