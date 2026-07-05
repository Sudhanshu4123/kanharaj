import type { Metadata } from "next"
import HomeContent from "./HomeContent"
import { JsonLd } from "@/components/seo/json-ld"
import {
  SITE,
  buildPageMetadata,
  buildWebsiteJsonLd,
  buildOrganizationJsonLd,
  buildRealEstateAgentJsonLd,
  buildSiteNavigationJsonLd,
  buildFaqJsonLd,
  HOME_FAQS,
} from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: 'kanharaj.com: Search India Real Estate and Properties.',
  description: 'Find your dream home or next investment opportunity with our extensive amount of available properties. Research localities with up to date property rates.',
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          buildWebsiteJsonLd(),
          buildOrganizationJsonLd(),
          buildRealEstateAgentJsonLd(),
          buildSiteNavigationJsonLd(),
          buildFaqJsonLd(HOME_FAQS),
        ]}
      />
      <HomeContent />
    </>
  )
}
