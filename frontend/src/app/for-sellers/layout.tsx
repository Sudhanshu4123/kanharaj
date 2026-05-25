import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sell or List Your Property Online in Dwarka | Kanharaj',
  description:
    'List your flat, plot or commercial property on Kanharaj. Reach verified buyers & tenants in Dwarka and Delhi NCR. Seller dashboard with leads & analytics.',
  path: '/for-sellers',
  keywords: [
    'list property dwarka',
    'sell flat dwarka',
    'property listing delhi',
    'real estate seller kanharaj',
  ],
})

export default function ForSellersLayout({ children }: { children: React.ReactNode }) {
  return children
}
