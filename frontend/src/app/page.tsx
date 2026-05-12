import type { Metadata } from "next"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "3 BHK Flats in Dwarka Delhi | Luxury Builder Floors | Shri Shyam Properties",
  description: "Buy premium 3 BHK flats in Dwarka Delhi with lift, parking & modern amenities. Contact Shri Shyam Properties today.",
  keywords: "3 BHK Flats in Dwarka, 3 BHK Flat for Sale in Dwarka, 3 BHK Flats in Dwarka Delhi, 3 BHK Builder Floor in Dwarka, Luxury 3 BHK Flats in Dwarka, Ready to Move 3 BHK Flats in Dwarka, 3 BHK Flats in Dwarka Sector 7, 3 BHK Flats in Dwarka Sector 12, 3 BHK Flats in Dwarka Sector 18, 3 BHK Flats near Metro Station, Independent Builder Floor in Dwarka, DDA Flats in Dwarka, Society Flats in Dwarka, 3 BHK Apartments in Dwarka, 3 BHK Flats for Rent in Dwarka, Affordable 3 BHK Flats in Dwarka, Premium 3 BHK Flats in Dwarka, Spacious 3 BHK Flats in Dwarka, 3 BHK Flats with Parking in Dwarka, 3 BHK Flats with Lift in Dwarka, Property in Dwarka Delhi, Flats for Sale in Dwarka Delhi, Best Property Dealer in Dwarka, Dwarka Real Estate, Flats near Vegas Mall Dwarka, Flats near Dwarka Metro Station, 3 BHK Flats under 1.5 Crore in Dwarka, 3 BHK Flats in Dwarka Expressway, Best 3 BHK Flats in Dwarka Delhi, Luxury Builder Floor in Dwarka Sector 8, Ready to Move Flats in Dwarka Delhi, 3 BHK Flats near Dwarka Sector 21 Metro, Affordable Flats in Dwarka Delhi, Independent Floors for Sale in Dwarka, Buy 3 BHK Flat in Dwarka Delhi, Premium Flats in Dwarka Sector 7, 3 BHK Society Flats in Dwarka Delhi, Builder Floor with Lift and Parking in Dwarka, Property Dealer in Dwarka, Real Estate Agent in Dwarka, Best Builder in Dwarka, Flats in Dwarka Delhi, Buy Property in Dwarka, Delhi NCR Real Estate, real estate investing, palam property dealer contact number, brokers in dwarka for rent, property dealer delhi, property dealer near me, dwarka broker contact number, property dealers in dwarka, real estate in delhi ncr dwarka, best property dealer in dwarka expressway",
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Shri Shyam Properties",
    "image": "https://shrishyamproperties.com/logo.png",
    "@id": "https://shrishyamproperties.com",
    "url": "https://shrishyamproperties.com",
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