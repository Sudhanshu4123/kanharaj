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
    default: "Kanharaj | Best Real Estate Agent in Dwarka, New Delhi",
    template: "%s | Kanharaj"
  },
  description: "Kanharaj is Dwarka's leading real estate consultancy. We provide verified listings for luxury flats, residential plots, and commercial spaces in Dwarka Sector 7, 10, 19 and more. Zero brokerage options available.",
  keywords: ["property dealer in dwarka", "best real estate agent Dwarka", "real estate investing", "palam property dealer contact number", "brokers in dwarka for rent", "property dealer delhi", "property dealer near me", "dwarka broker contact number", "property dealers in dwarka", "real estate in delhi ncr dwarka", "best property dealer in dwarka expressway"],
  authors: [{ name: "Kanharaj" }],
  creator: "Kanharaj",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kanharaj.com",
    title: "Kanharaj | Premium Real Estate in Dwarka",
    description: "Verified properties in Dwarka",
    siteName: "Kanharaj",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Kanharaj"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanharaj | Premium Real Estate",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SG9DCZDFPW"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SG9DCZDFPW');
          `}
        </Script>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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