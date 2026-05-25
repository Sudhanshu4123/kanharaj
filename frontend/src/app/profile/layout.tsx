import type { Metadata } from 'next'
import { Suspense } from 'react'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'My Profile',
  description: 'Manage your Kanharaj account and property activity.',
  path: '/profile',
  noIndex: true,
})

function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-24">
      <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ProfileLoading />}>{children}</Suspense>
}
