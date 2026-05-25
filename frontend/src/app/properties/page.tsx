import type { Metadata } from "next"
import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Flats, Plots & Villas for Sale & Rent in Dwarka | Kanharaj',
  description:
    'Browse verified flats, builder floors, plots & villas in Dwarka, New Delhi. Buy or rent residential & commercial properties with zero brokerage options on Kanharaj.',
  path: '/properties',
  keywords: [
    'flats for sale dwarka',
    'rent flat dwarka',
    'builder floor dwarka',
    'property listings dwarka delhi',
    '3 bhk flat dwarka',
  ],
})

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesPageSkeleton />}>
      <PropertiesContent />
    </Suspense>
  )
}
