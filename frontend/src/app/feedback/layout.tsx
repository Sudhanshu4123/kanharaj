import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Reviews & Feedback | Kanharaj Real Estate',
  description:
    'Share your experience with Kanharaj. Read reviews and submit feedback about property search, listings and customer support in Dwarka.',
  path: '/feedback',
})

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
