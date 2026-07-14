import type { Metadata } from 'next'

/** Canonical site config — used for metadata, JSON-LD, sitemap */
export const SITE = {
  name: 'Kanharaj',
  legalName: 'Kanharaj Real Estate',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kanharaj.com',
  tagline: 'Trusted by Millions — Rent Homes in Top Localities',
  description:
    "Rent Homes in Top Localities — Search trusted houses for rent near you — affordable, verified, move-in ready. Explore nearby houses & flats for rent — secure your next home today.",
  keywords: [
    'kanharaj',
    'kanharaj trusted by millions',
    'rent homes in top localities',
    'houses for rent near me',
    'trusted houses for rent',
    'affordable houses for rent',
    'verified houses for rent',
    'move-in ready homes',
    'flats for rent near me',
    'nearby houses for rent',
    'secure your next home',
    '3bhk luxury dda sfs flat',
    '3bhk dda sfs flats dwarka',
    'dda sfs flats for sale in dwarka',
    'dda sfs flats dwarka',
    'luxury sfs flats in dwarka',
    'dda flats dwarka sector 22',
    'dda flats dwarka sector 11',
    'dda flat dwarka',
    'dda flats for sale in delhi',
    'luxury dda flats dwarka',
    'property dealer in dwarka',
    'best real estate agent dwarka',
    'flats for sale in dwarka delhi',
    '3 bhk flats dwarka',
    'rent property dwarka',
    'zero brokerage flats dwarka',
    'builder floor dwarka',
    'property dealer near me',
    'real estate dwarka delhi',
    'property dealer in gurugram',
    'property dealer in noida',
    'real estate agent in gurugram',
    'real estate agent in noida',
    'flats for sale in gurugram',
    'flats for sale in noida',
    'kanharaj gurugram',
    'kanharaj noida',
    'Real Estate in Gurgaon',
    'Buy/Sell Property in Gurgaon',
    'Buy, Sell & Rent Properties in Gurgaon',
    'Luxury Residential Property in Gurugram',
    'Luxury Residential Property in Gurugram (Gurgaon)',
    'Properties in Gurgaon',
    'Verified Listings in Gurgaon',
    'Property for Sale in Gurgaon',
    'property in gurgaon',
    'Property for Sale in Gurugram, Haryana',
    'Property for Sale in Gurugram',
    'kanharaj delhi ncr',
    'kanharaj dwarka',
    'dwarka property dealer',
    'property dealers in dwarka',
    'real estate in dwarka',
    'broker in dwarka',
    'real estate agents near me',
    'construction contractors in dwarka delhi',
    'cunstruction service in dwarka delhi',
    'best property dealer in dwarka',
    'properties in dwarka',
    'real.estate brokers near me',
    'property dealers in dwarka for rent',
    'best property dealer in dwarka expressway',
    'real estate in delhi ncr dwarka',
    'dwarka property dealer contact number',
    'palam property dealer',
    'commercial property in dwarka delhi',
    'dwarka properties',
    'building consultants & contractors dwarka',
    'house for sale in uttam nagar',
    'dwarka property dealers contact number',
    'rent property near me',
    'brokers in delhi for rent',
    'commercial property in dwarka',
    'property dealer in dwarka sector 8',
    'real estate agents in dwarka delhi',
    'property in sector 7 dwarka',
    'commercial property',
    'real estate agent near me',
    'rent in palam delhi',
    'dwarka real estate agents',
    'property in paschim vihar',
    'looking for rent house near me',
    'no brokerage property',
    'property dealer in dwarka mor',
    'broker rent house',
    'property with pool near me',
    'commercial property delhi',
    'broker near me for room rent',
    'estate broker near me',
    'rent home near me',
    '2 BHK flats in Andheri West',
    'luxury apartments in Worli',
    'commercial property in BKC',
    'real estate consultant in Mumbai',
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
    name: 'Kanharaj — Verified Properties All india',
    description:
      'Explore verified flats, apartments & builder floors on Kanharaj. Start your home search in All india.',
    url: SITE.url,
  },
  {
    name: 'Flats, Plots & Villas for Sale',
    description:
      'Buy your dream home with Kanharaj. Browse verified residential & commercial listings in All india.',
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
      'List your property on Kanharaj. Reach serious buyers & tenants across All india.',
    url: `${SITE.url}/for-sellers`,
  },
  {
    name: 'Find Home on kanharaj.com ',
    description: 'Buy Your Dream Home with kanharaj.com.Verified Listings.',
    url: `${SITE.url}/properties`,
  }
] as const

/**
 * Centralized FAQ list used for BOTH the homepage UI and FAQPage schema.
 * Keeping them in sync ensures AI models always get the same answer that users see.
 */
export const HOME_FAQS = [
  {
    question: 'How to buy a property in Dwarka, Delhi?',
    answer:
      'To buy a property in Dwarka, browse our verified listings on Kanharaj, shortlist your preferred flat or floor, schedule a free site visit, and we will guide you through documentation, home-loan paperwork, and registry for a smooth, hassle-free purchase.',
  },
  {
    question: 'What is the average price of a 3 BHK flat in Dwarka, Delhi?',
    answer:
      'A 3 BHK flat in Dwarka typically ranges from \u20b91.2 Cr to \u20b92.5 Cr depending on the sector, floor, and amenities. Sectors 7, 10, 12, and 22 command the highest premiums. Contact Kanharaj for the latest market prices.',
  },
  {
    question: 'Does Kanharaj have properties in Noida and Gurugram?',
    answer:
      'Yes. Kanharaj lists premium residential flats, apartments, commercial spaces, and plots in Noida, Gurugram, Greater Noida, Ghaziabad, Faridabad, and other parts of Delhi NCR. Use our search filters to browse verified listings in these regions.',
  },
  {
    question: 'How do I find zero brokerage options in Gurugram or Noida?',
    answer:
      'Many listings in Gurugram and Noida are direct-from-builder or direct-from-owner, which carry zero brokerage. Simply select the city (Gurugram or Noida) and apply the Zero Brokerage filter to view commission-free properties.',
  },
  {
    question: 'Does Kanharaj offer zero-brokerage properties?',
    answer:
      'Yes. Many listings on Kanharaj.com are direct-from-builder or direct-from-owner, saving you the standard 1-2% brokerage fee. Look for the Zero Brokerage or Verified Direct badge on the listing cards.',
  },
  {
    question: 'Are all properties on Kanharaj verified?',
    answer:
      'Every listing undergoes a manual verification process including document checks, ownership confirmation, and on-site photo verification before going live on Kanharaj.com.',
  },
  {
    question: 'Can I get a home loan for properties listed on Kanharaj?',
    answer:
      'Yes. Kanharaj has tie-ups with leading banks and NBFCs to offer competitive home-loan rates starting at 8.5% p.a. Our advisors assist with eligibility checks, documentation, and end-to-end processing at no extra charge.',
  },
  {
    question: 'How do I list my property for sale or rent on Kanharaj?',
    answer:
      'Visit the Sell / List Your Property page, fill in the property details including photos, price, and location, and submit. Our team verifies and activates your listing within 24 hours. You reach thousands of active buyers and tenants every day.',
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
        { url: '/icon.png?v=5', type: 'image/png', sizes: '512x512' },
        { url: '/favicon-32x32.png?v=5', type: 'image/png', sizes: '32x32' },
        { url: '/favicon.ico?v=5', sizes: '48x48' },
      ],
      shortcut: '/icon.png?v=5',
      apple: '/apple-icon.png?v=5',
    },
    verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : undefined,
    category: 'Real Estate',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: SITE.name,
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
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
    areaServed: [
      {
        '@type': 'City',
        name: 'Dwarka, New Delhi',
      },
      {
        '@type': 'City',
        name: 'Gurugram',
      },
      {
        '@type': 'City',
        name: 'Noida',
      },
      {
        '@type': 'City',
        name: 'Delhi NCR',
      }
    ],
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

/** Build a Google-compliant FAQPage JSON-LD for AEO / voice search optimization */
export function buildFaqJsonLd(faqs: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** Resolve the schema.org @type from our property type string */
function resolveAccommodationType(propertyType?: string): string {
  const t = (propertyType || '').toUpperCase()
  if (t === 'APARTMENT' || t === 'FLAT') return 'Apartment'
  if (t === 'VILLA') return 'House'
  if (t === 'HOUSE' || t.includes('INDEPENDENT')) return 'SingleFamilyResidence'
  if (t === 'HOTEL') return 'LodgingBusiness'
  if (t.includes('PLOT') || t.includes('LAND')) return 'LandOrLotProperty'
  if (t === 'COMMERCIAL') return 'CommercialProperty'
  return 'Accommodation'
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
  /** Extra rich fields for GEO / AEO */
  area?: number
  bedrooms?: number
  bathrooms?: number
  yearBuilt?: number
  amenities?: string[]
  latitude?: number
  longitude?: number
}) {
  const pageUrl = absoluteUrl(`/property/${property.id}`)
  const images = (property.images || [])
    .slice(0, 5)
    .map((img) => (img.startsWith('http') ? img : absoluteUrl(img.startsWith('/') ? img : `/api/uploads/${img}`)))

  const offerType =
    property.listingType?.toLowerCase() === 'rent' ? 'RentAction' : 'SellAction'

  const accommodationType = resolveAccommodationType(property.propertyType)

  const amenityFeatures = (property.amenities || []).map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a,
    value: true,
  }))

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
    ...(property.latitude && property.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: property.latitude, longitude: property.longitude } }
      : {}),
    potentialAction: {
      '@type': offerType,
      target: pageUrl,
    },
    containedInPlace: {
      '@type': accommodationType,
      name: property.title,
      description: property.description || property.title,
      url: pageUrl,
      image: images.length ? images : [SITE_OG_IMAGE],
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address || 'Dwarka',
        addressLocality: property.city || 'New Delhi',
        addressRegion: property.state || 'Delhi',
        addressCountry: 'IN',
      },
      ...(property.bedrooms ? { numberOfRooms: property.bedrooms } : {}),
      ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
      ...(property.area ? { floorSize: { '@type': 'QuantitativeValue', value: property.area, unitCode: 'FTK' } } : {}),
      ...(property.yearBuilt ? { yearBuilt: property.yearBuilt } : {}),
      ...(amenityFeatures.length ? { amenityFeature: amenityFeatures } : {}),
      ...(property.latitude && property.longitude
        ? { geo: { '@type': 'GeoCoordinates', latitude: property.latitude, longitude: property.longitude } }
        : {}),
    },
  }
}
