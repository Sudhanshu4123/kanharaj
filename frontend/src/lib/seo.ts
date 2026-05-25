import type { Metadata } from 'next'

/** Canonical site config — used for metadata, JSON-LD, sitemap */
export const SITE = {
  name: 'Kanharaj',
  legalName: 'Kanharaj Real Estate',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kanharaj.com',
  tagline: 'Buy/Sell/Rent Property Online in Dwarka, Delhi',
  description:
    "Dwarka's trusted real estate platform. Buy, rent & sell verified flats, builder floors, plots & villas in Dwarka Sector 7, 10, 19 and more. Zero brokerage options. Expert guidance for home loans.",
  keywords: [
    'property dealer in dwarka',
    'best real estate agent dwarka',
    'flats for sale in dwarka delhi',
    '3 bhk flats dwarka',
    'rent property dwarka',
    'zero brokerage flats dwarka',
    'builder floor dwarka',
    'property dealer near me',
    'real estate dwarka delhi',
    'kanharaj',
  ],
  phone: '+919599801767',
  phoneDisplay: '+91 95998 01767',
  email: 'kanharaj1389@gmail.com',
  logoPath: '/logo.png',
  ogImagePath: '/logo.png',
  locale: 'en_IN',
  address: {
    street: '2nd Floor, Vardhaman City Mall, Sector 7',
    locality: 'Dwarka',
    city: 'New Delhi',
    region: 'Delhi',
    postalCode: '110078',
    country: 'IN',
  },
  geo: { latitude: 28.5823, longitude: 77.05 },
  hours: { opens: '09:00', closes: '21:00' },
  sameAs: [
    'https://www.facebook.com/kanharaj',
    'https://www.instagram.com/kanharaj',
  ],
} as const

export const SITE_LOGO = `${SITE.url}${SITE.logoPath}`
export const SITE_OG_IMAGE = `${SITE.url}${SITE.ogImagePath}`

/** Main navigation — helps Google understand sitelinks structure */
export const SITE_NAV_LINKS = [
  {
    name: 'Kanharaj — Verified Properties in Dwarka',
    description:
      'Explore verified flats, apartments & builder floors on Kanharaj. Start your home search in Dwarka, Delhi.',
    url: SITE.url,
  },
  {
    name: 'Flats, Plots & Villas for Sale',
    description:
      'Buy your dream home with Kanharaj. Browse verified residential & commercial listings in Dwarka.',
    url: `${SITE.url}/properties?listing=buy`,
  },
  {
    name: 'Rent Property in Dwarka',
    description:
      'Find flats & houses for rent in Dwarka, New Delhi. Verified listings with zero brokerage options.',
    url: `${SITE.url}/properties?listing=rent`,
  },
  {
    name: 'Sell or List Your Property',
    description:
      'List your property on Kanharaj. Reach serious buyers & tenants across Dwarka and Delhi NCR.',
    url: `${SITE.url}/for-sellers`,
  },
  {
    name: 'Contact Kanharaj',
    description:
      'Call, WhatsApp or email Kanharaj for property buying, renting and selling in Dwarka.',
    url: `${SITE.url}/contact`,
  },
] as const

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildPageMetadata(opts: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  noIndex?: boolean
}): Metadata {
  const canonical = opts.path ? absoluteUrl(opts.path) : SITE.url
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ?? [...SITE.keywords],
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url: canonical,
      siteName: SITE.name,
      title: opts.title,
      description: opts.description,
      images: [
        {
          url: SITE_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE.name} — Real Estate in Dwarka`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [SITE_OG_IMAGE],
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export function buildRootMetadata(): Metadata {
  const title = `${SITE.name} Official Website - ${SITE.tagline}`
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
    keywords: [...SITE.keywords],
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    formatDetection: { email: false, address: false, telephone: false },
    alternates: { canonical: SITE.url },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      url: SITE.url,
      siteName: SITE.name,
      title,
      description: SITE.description,
      images: [
        {
          url: SITE_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE.name} — Premium Real Estate in Dwarka`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kanharaj',
      title,
      description: SITE.description,
      images: [SITE_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
        { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    category: 'Real Estate',
  }
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: ['Kanharaj.com', 'Kanharaj Real Estate'],
    url: SITE.url,
    description: SITE.description,
    publisher: { '@id': `${SITE.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/properties?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-IN',
  }
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: SITE_LOGO,
      width: 512,
      height: 512,
    },
    image: SITE_LOGO,
    description: SITE.description,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    sameAs: SITE.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  }
}

export function buildRealEstateAgentJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${SITE.url}/#agent`,
    name: SITE.name,
    image: SITE_LOGO,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '₹₹-₹₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: SITE.hours.opens,
      closes: SITE.hours.closes,
    },
    areaServed: {
      '@type': 'City',
      name: 'Dwarka, New Delhi',
    },
  }
}

export function buildSiteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} Site Navigation`,
    itemListElement: SITE_NAV_LINKS.map((link, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebPage',
        '@id': link.url,
        name: link.name,
        description: link.description,
        url: link.url,
      },
    })),
  }
}

export function buildPropertyJsonLd(property: {
  id: string | number
  title: string
  description?: string
  price?: number
  listingType?: string
  propertyType?: string
  address?: string
  city?: string
  state?: string
  images?: string[]
  bhk?: string | number
}) {
  const pageUrl = absoluteUrl(`/property/${property.id}`)
  const images = (property.images || [])
    .slice(0, 5)
    .map((img) => (img.startsWith('http') ? img : absoluteUrl(img.startsWith('/') ? img : `/api/uploads/${img}`)))

  const offerType =
    property.listingType?.toLowerCase() === 'rent' ? 'RentAction' : 'SellAction'

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || property.title,
    url: pageUrl,
    image: images.length ? images : [SITE_OG_IMAGE],
    datePosted: new Date().toISOString(),
    offers: {
      '@type': 'Offer',
      price: property.price || undefined,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || 'Dwarka',
      addressLocality: property.city || 'New Delhi',
      addressRegion: property.state || 'Delhi',
      addressCountry: 'IN',
    },
    ...(property.bhk
      ? {
          numberOfRooms: property.bhk,
        }
      : {}),
    potentialAction: {
      '@type': offerType,
      target: pageUrl,
    },
  }
}
