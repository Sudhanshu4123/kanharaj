import type { Metadata } from "next"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "Kanharaj Builder | Dwarka's Premium Real Estate Platform",
  description: "Find your dream home with Kanharaj Builder. We offer premium residential and commercial properties in Dwarka, New Delhi. Best property consultancy for buying, selling, and renting.",
  keywords: "home for sale, rent apartment Dwarka, Kanharaj Builder, luxury real estate New Delhi, property agent Dwarka",
}

export default function HomePage() {
  return <HomeContent />
}