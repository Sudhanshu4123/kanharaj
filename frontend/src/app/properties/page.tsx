import type { Metadata } from "next"
import { Suspense } from 'react'
import PropertiesContent from "./PropertiesContent"

export const metadata: Metadata = {
  title: "Properties | Kanharaj - Discover Premium Real Estate in Dwarka",
  description: "Browse our extensive portfolio of residential and commercial properties in Dwarka, New Delhi. Find your perfect home, villa, or office space with Kanharaj.",
  keywords: "property listings, buy house Dwarka, rent apartment New Delhi, luxury villas, commercial space, real estate portfolio",
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-600 border-t-transparent" />
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  )
}