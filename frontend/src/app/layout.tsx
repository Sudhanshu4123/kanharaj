import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoadingProvider } from "@/components/loading-provider"

export const metadata: Metadata = {
  title: "kanharaj | Dwarka's Premium Real Estate Platform",
  description: "Discover your dream property with kanharaj. Premium real estate listings for buy, rent, and commercial properties in Dwarka, New Delhi.",
  keywords: "real estate, properties, buy house, rent apartment, luxury homes, Dwarka real estate, New Delhi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LoadingProvider>
          <Header />
          <main className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
        </LoadingProvider>
      </body>
    </html>
  )
}