import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { LoadingProvider } from "@/components/loading-provider"
import Script from "next/script"

import { AuthProvider } from "@/components/auth-provider"
import { CrossSiteLogoutHandler } from "@/components/cross-site-logout"
import { Suspense } from "react"
import { buildRootMetadata } from "@/lib/seo"

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#E11D48",
}

export const metadata: Metadata = buildRootMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-IN">
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
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <AuthProvider>
          <Suspense fallback={null}>
            <CrossSiteLogoutHandler />
          </Suspense>
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
