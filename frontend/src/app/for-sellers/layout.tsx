import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'kanharaj.com: Post Your Property for Sale or Rent Online',
  description:
    'Create a free property listing and reach high-intent verified buyers and tenants across India.\nSell, rent or lease your property faster with kanharaj.com.',
  path: '/for-sellers',
  keywords: [
    'Post Your Property for Sale or Rent Online',
    'Create a free property listing',
    'list property dwarka',
    'sell flat dwarka',
    'property listing delhi',
    'real estate seller kanharaj',
  ],
})

export default function ForSellersLayout({ children }: { children: React.ReactNode }) {
  return children
}
