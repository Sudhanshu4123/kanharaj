import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'My Profile',
  description: 'Manage your Kanharaj account and property activity.',
  path: '/profile',
  noIndex: true,
})

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
