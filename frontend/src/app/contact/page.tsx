import type { Metadata } from "next"
import ContactContent from "./ContactContent"
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Kanharaj — Property Inquiries in Dwarka, Delhi',
  description:
    'Contact Kanharaj for property buying, renting & selling in Dwarka. Call +91 95998 01767, WhatsApp, or email for verified listings and expert advice.',
  path: '/contact',
})

export default function ContactPage() {
  return <ContactContent />
}
