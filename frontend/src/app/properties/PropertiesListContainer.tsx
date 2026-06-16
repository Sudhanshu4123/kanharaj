import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildFaqJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

function generateLocationFaqs(place: string, listing: string, type: string) {
  const isRent = listing.toLowerCase() === 'rent'
  const actionVerb = isRent ? 'rent' : 'buy'
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

export function PropertiesListContainer({ searchParams }: Props) {
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
