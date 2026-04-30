import type { Metadata } from "next"
import AboutContent from "./AboutContent"

export const metadata: Metadata = {
  title: "About Us | Kanharaj Builder - Real Estate Experts in Dwarka",
  description: "Learn more about Kanharaj Builder, Dwarka's leading real estate consultancy. Our mission is to provide transparent and personalized property services.",
  keywords: "about real estate, Kanharaj Builder, Dwarka builders, real estate story, premium property agency",
}

export default function AboutPage() {
  return <AboutContent />
}