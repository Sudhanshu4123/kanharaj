import type { Metadata } from "next"
import { Suspense } from 'react'
import ContactContent from "./ContactContent"
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Kanharaj — Property Inquiries in Dwarka, Delhi',
  description:
    'Contact Kanharaj for property buying, renting & selling in Dwarka. Call +91 95998 01767, WhatsApp, or email for verified listings and expert advice.',
  path: '/contact',
})

function ContactLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactLoading />}>
      <ContactContent />
    </Suspense>
  )
}
