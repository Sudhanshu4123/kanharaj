import type { Metadata } from "next"
import AboutContent from "./AboutContent"
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About Kanharaj — Trusted Real Estate Experts in Dwarka',
  description:
    'Learn about Kanharaj, Dwarka\'s trusted real estate consultancy. Transparent buying, selling & renting with verified listings and expert local guidance.',
  path: '/about',
})

export default function AboutPage() {
  return <AboutContent />
}
