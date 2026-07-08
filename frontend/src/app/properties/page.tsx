import type { Metadata } from "next"
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import PropertiesContent from "./PropertiesContent"
import { PropertiesPageSkeleton } from '@/components/skeletons/property-skeletons'
import { buildPageMetadata, buildFaqJsonLd } from '@/lib/seo'
import { JsonLd } from '@/components/seo/json-ld'
import { INDIAN_STATES, DELHI_FAMOUS_PLACES, NCR_CITIES } from '@/lib/location-data'
import { PropertiesListContainer } from './PropertiesListContainer'

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getPropertiesForSeo(): Promise<any[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
    const res = await fetch(`${apiUrl}/properties?size=1000&t=${Date.now()}`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.content ?? (Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('Failed to fetch properties for SEO:', err)
    return []
  }
}

async function buildDynamicSeoDescription(place: string, listingMode: string): Promise<string> {
  const properties = await getPropertiesForSeo()
  const targetCity = place && place !== 'All India' ? place : 'Delhi'
  const cityProperties = properties.filter(
    (p: any) => (p.city || '').toLowerCase() === targetCity.toLowerCase()
  )

  const flatsCount = cityProperties.filter(
    (p: any) => (p.propertyType || '').toUpperCase() === 'APARTMENT' || (p.propertyType || '').toUpperCase() === 'FLAT'
  ).length

  const housesCount = cityProperties.filter(
    (p: any) => (p.propertyType || '').toUpperCase() === 'HOUSE' || (p.propertyType || '').toUpperCase() === 'VILLA'
  ).length

  const bhk2or3Count = cityProperties.filter(
    (p: any) => (p.bedrooms === 2 || p.bedrooms === 3) && (p.listingType || '').toUpperCase() === (listingMode || 'BUY').toUpperCase()
  ).length

  const newProjectsCount = cityProperties.filter(
    (p: any) => parseInt(p.id) % 3 === 0 || (p.title || '').toLowerCase().includes('new') || (p.description || '').toLowerCase().includes('booking')
  ).length

  const resaleProjectsCount = cityProperties.filter(
    (p: any) => !(parseInt(p.id) % 3 === 0 || (p.title || '').toLowerCase().includes('new') || (p.description || '').toLowerCase().includes('booking'))
  ).length

  const ownerPropertiesCount = cityProperties.filter(
    (p: any) => (p.user?.role || '').toLowerCase() === 'seller' || (p.user?.role || '').toLowerCase() === 'user' || (p.userId && !p.user)
  ).length

  const flatsStr = flatsCount > 0 ? `${flatsCount}+` : '0'
  const housesStr = housesCount > 0 ? `${housesCount}+` : '0'
  const bhkStr = bhk2or3Count > 0 ? `${bhk2or3Count}+` : '0'
  const newStr = newProjectsCount > 0 ? `${newProjectsCount}+` : '0'
  const resaleStr = resaleProjectsCount > 0 ? `${resaleProjectsCount}+` : '0'
  const ownerStr = ownerPropertiesCount > 0 ? `${ownerPropertiesCount}+` : '0'

  const actionLabel = (listingMode || 'BUY').toLowerCase() === 'rent' ? 'rent' : 'sale'

  return `Looking for Property in ${targetCity}? kanharaj.com offers ${flatsStr} Flats & ${housesStr} Houses/Villas. Search from ${bhkStr} 2 & 3 BHK properties for ${actionLabel} in ${targetCity}. Choose from ${newStr} New Projects, ${resaleStr} Resale Projects and ${ownerStr} Owner Properties for ${actionLabel} in ${targetCity}. 100% Verified Properties.`
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const state = typeof searchParams.state === 'string' ? searchParams.state : ''
  const listing = typeof searchParams.listing === 'string' ? searchParams.listing : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''
  const search = typeof searchParams.search === 'string' ? searchParams.search : ''

  let place = 'All India'
  if (city && state) {
    place = `${city}, ${state}`
  } else {
    place = city || state || search || 'All India'
  }
  
  let listingLabel = 'Properties'
  if (listing.toLowerCase() === 'rent') {
    listingLabel = 'Properties for Rent'
  } else if (listing.toLowerCase() === 'buy') {
    listingLabel = 'Properties for Sale'
  }

  let typeLabel = 'Properties'
  if (type) {
    typeLabel = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() + 's'
  }

  let title = ''
  let description = ''
  
  const isDelhiPlace = DELHI_FAMOUS_PLACES.some(p => p.toLowerCase() === place.toLowerCase())
  const isNcrCity = NCR_CITIES.some(c => c.toLowerCase() === place.toLowerCase())
  const isIndianState = INDIAN_STATES.some(s => s.toLowerCase() === place.toLowerCase())

  if (isDelhiPlace) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place}, Delhi | Premium Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place}, Delhi | Kanharaj`
    description = await buildDynamicSeoDescription(place, listing)
  } else if (isNcrCity) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place}, Delhi NCR | Verified Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place}, Delhi NCR | Kanharaj`
    description = await buildDynamicSeoDescription(place, listing)
  } else if (isIndianState) {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place} | Real Estate Listings - Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place} | Kanharaj`
    description = await buildDynamicSeoDescription(place, listing)
  } else {
    title = typeLabel === 'Properties'
      ? `${listingLabel} in ${place} | Kanharaj`
      : `${typeLabel} for ${listing === 'rent' ? 'Rent' : 'Sale'} in ${place} | Kanharaj`
    description = await buildDynamicSeoDescription(place, listing)
  }

  const customKeywords: string[] = []
  const normalizedPlace = place.toLowerCase().trim()
  const listingLower = listing.toLowerCase()

  if (type.toLowerCase() === 'commercial' && (normalizedPlace === 'all india' || normalizedPlace === 'india' || normalizedPlace === '')) {
    title = 'Commercial Real Estate in India | kanharaj.com'
    description = await buildDynamicSeoDescription(place, listing)
    customKeywords.push('Commercial Real Estate in India')
  } else if (normalizedPlace === 'new delhi' || normalizedPlace === 'delhi') {
    if (listingLower === 'rent') {
      title = 'Real Estate in New Delhi | Rent Property in New Delhi - KANHARAJ'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in New Delhi', 'Rent Property in New Delhi')
    } else {
      title = 'Real Estate in New Delhi | Buy/Sell Property in New Delhi'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in New Delhi', 'Buy/Sell Property in New Delhi')
    }
  } else if (normalizedPlace === 'noida') {
    if (type.toLowerCase().includes('project')) {
      title = 'New Residential Projects in Noida'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('New Residential Projects in Noida', 'Residential Projects in Noida')
    } else if (listingLower === 'rent') {
      title = 'Real Estate in Noida | Rent Property in Noida | kanharaj.com'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Noida', 'Rent Property in Noida')
    } else {
      title = 'Real Estate in Noida | Buy/Sell Property in Noida | kanharaj.com'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Noida', 'Buy/Sell Property in Noida')
    }
  } else if (normalizedPlace.includes('ats greens') || normalizedPlace.includes('sector- 50, gurgaon') || normalizedPlace.includes('sector 50 gurgaon')) {
    title = '3 BHK Apartment in Ats greens a block sector- 50, gurgaon'
    description = 'Explore premium 3 BHK apartments for sale & rent in ATS Greens A Block, Sector 50, Gurgaon. Browse verified listings, floor plans, zero brokerage options, and top amenities at kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Ats greens a block sector- 50, gurgaon', 'ATS Greens Sector 50 Gurgaon')
  } else if (normalizedPlace.includes('ats grandstand') || normalizedPlace.includes('sector- 99a') || normalizedPlace.includes('sector 99a')) {
    title = '3 BHK Apartment in Ats grandstand sector- 99a gurgaon dwarka expressway'
    description = 'Discover premium 3 BHK apartments for sale & rent in ATS Grandstand, Sector 99A, Gurgaon near Dwarka Expressway. View verified listings, real photos, floor configurations, and pricing options at kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Ats grandstand sector- 99a gurgaon dwarka expressway', 'ATS Grandstand Sector 99A')
  } else if (normalizedPlace.includes('sara crescent') || normalizedPlace.includes('sector- 92') || normalizedPlace.includes('sector 92')) {
    title = '3 BHK Apartment in Sara crescent green Park sector- 92, gurgaon'
    description = 'Browse beautiful 3 BHK apartments for sale & rent in Sara Crescent Green Park, Sector 92, Gurgaon. Explore verified listings, pricing, nearby locations, and zero brokerage options on kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Sara crescent green Park sector- 92, gurgaon', 'Sara Crescent Sector 92 Gurgaon')
  } else if (normalizedPlace.includes('ats triumph') || normalizedPlace.includes('triumph dhanwanpur')) {
    title = '3 BHK Apartment in Ats triumph dhanwanpur village sector- 104, gurgaon'
    description = 'Looking for a 3 BHK in ATS Triumph? Explore premium apartments in ATS Triumph, Dhanwapur Village, Sector 104, Gurgaon. Browse verified direct-from-owner and zero-brokerage listings at kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Ats triumph dhanwanpur village sector- 104, gurgaon', 'ATS Triumph Sector 104')
  } else if (normalizedPlace.includes('ats kocoon') || normalizedPlace.includes('sector- 109') || normalizedPlace.includes('sector 109')) {
    title = '3 BHK Apartment in Ats kocoon sector- 109, gurgaon dwarka expressway'
    description = 'Explore luxury 3 BHK apartments in ATS Kocoon, Sector 109, Gurgaon on Dwarka Expressway. Find verified residential properties for sale and rent with premium amenities on kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Ats kocoon sector- 109, gurgaon dwarka expressway', 'ATS Kocoon Sector 109')
  } else if (normalizedPlace.includes('ats sanctuary') || normalizedPlace.includes('jayvihar') || normalizedPlace.includes('sector- 105') || normalizedPlace.includes('sector 105')) {
    title = '3 BHK Apartment in Ats sanctuary jayvihar sector- 105, gurgaon dwarka expressway'
    description = 'Browse premium 3 BHK apartments for sale & rent in ATS Sanctuary, Jay Vihar, Sector 105, Gurgaon near Dwarka Expressway. View verified listings and pricing at kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Ats sanctuary jayvihar sector- 105, gurgaon dwarka expressway', 'ATS Sanctuary Sector 105')
  } else if (normalizedPlace.includes('centrum park') || normalizedPlace.includes('indiabulls') || normalizedPlace.includes('sector- 103') || normalizedPlace.includes('sector 103')) {
    title = '2 BHK Apartment in Indiabulls Centrum park sector- 103, gurgaon dwarka expressway'
    description = 'Find verified 2 BHK apartments in Indiabulls Centrum Park, Sector 103, Gurgaon along Dwarka Expressway. View direct seller listings, floor plans, and pricing on kanharaj.com.'
    customKeywords.push('2 BHK Apartment in Indiabulls Centrum park sector- 103, gurgaon dwarka expressway', 'Centrum Park Sector 103')
  } else if (normalizedPlace.includes('hero homes')) {
    title = '3 BHK Apartment in Hero homes sector- 104 gurgaon'
    description = 'Explore premium 3 BHK flats for sale & rent in Hero Homes, Sector 104, Gurgaon. Browse verified configurations, amenities, location benefits, and zero brokerage options on kanharaj.com.'
    customKeywords.push('3 BHK Apartment in Hero homes sector- 104 gurgaon', 'Hero Homes Sector 104 Gurgaon')
  } else if (normalizedPlace === 'gurgaon' || normalizedPlace === 'gurugram') {
    title = 'Properties in Gurgaon'
    description = await buildDynamicSeoDescription(place, listing)
    customKeywords.push('Properties in Gurgaon', 'Properties in Gurugram')
  } else if (normalizedPlace === 'faridabad') {
    if (listingLower !== 'rent') {
      title = 'Real Estate in Faridabad | Buy/Sell Property in Faridabad'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Faridabad', 'Buy/Sell Property in Faridabad')
    }
  } else if (normalizedPlace === 'ghaziabad') {
    if (listingLower !== 'rent') {
      title = 'Real Estate in Ghaziabad | Buy/Sell Property in Ghaziabad'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Ghaziabad', 'Buy/Sell Property in Ghaziabad')
    }
  } else if (normalizedPlace === 'bengaluru' || normalizedPlace === 'bangalore') {
    if (listingLower === 'rent') {
      title = 'Real Estate in Bengaluru | Rent Property in Bengaluru - kanharaj'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Bengaluru', 'Rent Property in Bengaluru')
    }
  } else if (normalizedPlace === 'pune') {
    if (listingLower === 'rent') {
      title = 'Real Estate in Pune | Rent Property in Pune | kanharaj.com'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Pune', 'Rent Property in Pune')
    }
  } else if (normalizedPlace === 'jaipur') {
    if (listingLower !== 'rent') {
      title = 'Real Estate in Jaipur | Buy/Sell Property in Jaipur - kanharaj'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in Jaipur', 'Buy/Sell Property in Jaipur')
    }
  } else if (normalizedPlace === 'india' || normalizedPlace === 'all india' || normalizedPlace === '') {
    if (listingLower === 'rent') {
      title = 'Real Estate in India | Rent Property in India | kanharaj.com'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in India', 'Rent Property in India')
    } else if (listingLower === 'buy' || listingLower === 'sell') {
      title = 'Search India Real Estate and Properties'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Search India Real Estate and Properties')
    } else {
      title = 'Real Estate in India | Rent Property in India | kanharaj.com'
      description = await buildDynamicSeoDescription(place, listing)
      customKeywords.push('Real Estate in India', 'Rent Property in India')
    }
  }

  const keywords = [
    ...customKeywords,
    `flats for sale in ${place}`,
    `properties in ${place}`,
    `rent flat in ${place}`,
    `builder floor ${place}`,
    `real estate agent ${place}`,
    `kanharaj ${place}`
  ]

  let canonicalPath = '/properties'
  const pathParams = new URLSearchParams()
  if (city) pathParams.set('city', city)
  if (state) pathParams.set('state', state)
  if (listing) pathParams.set('listing', listing)
  if (type) pathParams.set('type', type)
  if (search) pathParams.set('search', search)
  const qs = pathParams.toString()
  if (qs) canonicalPath += `?${qs}`

  return buildPageMetadata({
    title,
    description,
    path: canonicalPath,
    keywords,
  })
}



export default function PropertiesPage({ searchParams }: Props) {
  const city = typeof searchParams.city === 'string' ? searchParams.city : ''
  const listing = typeof searchParams.listing === 'string' ? searchParams.listing : ''
  const type = typeof searchParams.type === 'string' ? searchParams.type : ''

  if (listing && (listing.toLowerCase() === 'buy' || listing.toLowerCase() === 'rent')) {
    const listingPart = listing.toLowerCase()
    let path = `/${listingPart}`
    
    if (type) {
      const t = type.toLowerCase()
      let typePart = t
      if (t.includes('flat') || t.includes('apartment')) {
        typePart = 'flat'
      } else if (t.includes('floor')) {
        typePart = 'floor'
      } else if (t.includes('villa')) {
        typePart = 'villa'
      } else if (t.includes('house')) {
        typePart = 'house'
      } else if (t.includes('plot') || t.includes('land')) {
        typePart = 'plot'
      } else if (t.includes('commercial')) {
        typePart = 'commercial'
      }
      path += `/${typePart}`
    }

    if (city) {
      path += `/${city.toLowerCase().replace(/\s+/g, '-')}`
    }

    const remainingParams = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key !== 'listing' && key !== 'type' && key !== 'city') {
        if (typeof val === 'string') {
          remainingParams.set(key, val)
        } else if (Array.isArray(val)) {
          val.forEach(v => remainingParams.append(key, v))
        }
      }
    })

    const qs = remainingParams.toString()
    const finalUrl = qs ? `${path}?${qs}` : path
    
    redirect(finalUrl)
  }

  return <PropertiesListContainer searchParams={searchParams} />
}
