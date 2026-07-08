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

  let typePrefix = 'Flats'
  if (type) {
    const t = type.toLowerCase()
    if (t.includes('villa')) typePrefix = 'Villas'
    else if (t.includes('house')) typePrefix = 'Houses'
    else if (t.includes('plot') || t.includes('land')) typePrefix = 'Plots/Land'
    else if (t.includes('floor')) typePrefix = 'Builder Floors'
    else if (t.includes('commercial')) typePrefix = 'Commercial Properties'
    else if (t.includes('pg')) typePrefix = 'PGs'
    else typePrefix = type.charAt(0).toUpperCase() + type.slice(1) + 's'
  }

  const actionVerb = listing.toLowerCase() === 'rent' ? 'Rent' : 'Sale'
  const title = `${typePrefix} for ${actionVerb} in ${place} | kanharaj.com`

  const description = await buildDynamicSeoDescription(place, listing || 'BUY')

  const keywords = [
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
