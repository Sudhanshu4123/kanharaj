import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { LoadingProvider } from "@/components/loading-provider"
import Script from "next/script"

import { AuthProvider } from "@/components/auth-provider"

export const metadata: Metadata = {
  title: {
    default: "Kanharaj Builder | Dwarka's Premium Real Estate Platform",
    template: "%s | Kanharaj Builder"
  },
  description: "Discover your dream property with Kanharaj Builder. Premium real estate listings for buy, rent, and commercial properties in Dwarka, New Delhi.",
  keywords: ["real estate", "properties", "buy house", "rent apartment", "luxury homes", "Dwarka real estate", "New Delhi", "Kanharaj Builder"],
  authors: [{ name: "Kanharaj Builder" }],
  creator: "Kanharaj Builder",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kanharaj.com",
    title: "Kanharaj Builder | Premium Real Estate in Dwarka",
    description: "Premium real estate listings for buy, rent, and commercial properties in Dwarka, New Delhi.",
    siteName: "Kanharaj Builder",
    images: [{
      url: "/logo.png",
      width: 1200,
      height: 630,
      alt: "Kanharaj Builder"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanharaj Builder | Premium Real Estate",
    description: "Premium real estate listings in Dwarka, New Delhi.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SG9DCZDFPW"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SG9DCZDFPW');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LoadingProvider>
            <Header />
            <main className="flex-1 pt-20 pb-20 lg:pb-0">
              {children}
            </main>
            <MobileNav />
            <Footer />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}