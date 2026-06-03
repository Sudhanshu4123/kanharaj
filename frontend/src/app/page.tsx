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
  title: `${SITE.name} Official Website - ${SITE.tagline}`,
  description: SITE.description,
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
