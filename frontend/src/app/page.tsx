import type { Metadata } from "next"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "Kanharaj Builder | Best Real Estate Agent & Property Dealer in Dwarka Delhi",
  description: "Explore premium properties with Kanharaj Builder, the most trusted real estate agent in Dwarka, New Delhi. Buy, sell, or rent luxury flats, 2BHK in Dwarka, builder floors in Delhi, and residential projects in Dwarka Sector 7, 10, 12 & more.",
  keywords: "property dealer in dwarka, 2bhk flat in dwarka, builder floor in delhi, best property dealer in Dwarka, real estate agent in Dwarka Delhi, buy 3 BHK flats in Dwarka, property for sale in Dwarka Sector 7, luxury residential projects Dwarka, commercial property for rent in Dwarka, Kanharaj Builder, Dwarka real estate platform",
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Kanharaj Builder",
    "image": "https://kanharajbuilder.com/logo.png",
    "@id": "https://kanharajbuilder.com",
    "url": "https://kanharajbuilder.com",
    "telephone": "+919599801767",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sector 7, Dwarka",
      "addressLocality": "New Delhi",
      "postalCode": "110075",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.5823,
      "longitude": 77.0500
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "21:00"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  )
}