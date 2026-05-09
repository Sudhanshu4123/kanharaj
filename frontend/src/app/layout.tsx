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
    default: "Kanharaj Builder | Best Real Estate Agent in Dwarka, New Delhi",
    template: "%s | Kanharaj Builder"
  },
  description: "Kanharaj Builder is Dwarka's leading real estate consultancy. We provide verified listings for luxury flats, residential plots, and commercial spaces in Dwarka Sector 7, 10, 19 and more. Zero brokerage options available.",
  keywords: ["property dealer in dwarka", "2bhk flat in dwarka", "builder floor in delhi", "best real estate agent Dwarka", "property dealer in Dwarka Delhi", "buy flats in Dwarka", "luxury homes Dwarka", "commercial property Dwarka", "Dwarka Sector 7 real estate", "Kanharaj Builder", "New Delhi property portal"],
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