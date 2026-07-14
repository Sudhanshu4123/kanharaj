import type { Metadata, ResolvingMetadata } from "next"
import PropertyDetailContent from "../../property/[id]/PropertyDetailContent"
import { notFound, redirect } from "next/navigation"
import { JsonLd } from "@/components/seo/json-ld"
import { absoluteUrl, buildPropertyJsonLd, SITE, SITE_OG_IMAGE } from "@/lib/seo"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

function normalizeImage(img: string): string {
  if (!img) return ''
  if (img.startsWith('http')) return img
  if (img.startsWith('/api/uploads/') || img.startsWith('/uploads/')) return img
  if (img.startsWith('api/uploads/')) return `/${img}`
  if (img.startsWith('uploads/')) return `/api/${img}`
  return img
}

async function getProperty(id: string) {
  const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  const fetchUrl = INTERNAL_BACKEND_URL?.includes('/api') 
    ? `${INTERNAL_BACKEND_URL}/properties/${id}`
    : `${INTERNAL_BACKEND_URL}/api/properties/${id}`;

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      console.error(`[ProjectPage] API returned ${res.status} for id=${id}, url=${fetchUrl}`)
      return null
    }
    return res.json()
  } catch (error) {
    console.error("[ProjectPage] Error fetching property:", error, "URL:", fetchUrl)
    return null
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const property = await getProperty(id)

  if (!property) {
    return {
      title: "Project Not Found | Kanharaj",
    }
  }

  const description = property.description
    ? `${String(property.description).slice(0, 160)}...`
    : `${property.title} - Located in ${property.address || ''}, ${property.city || ''}`

  const rawImages: string[] = Array.isArray(property.images)
    ? property.images
    : (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : [])

  const pageUrl = absoluteUrl(`/project/${id}`)
  const ogImages = rawImages
    .map(normalizeImage)
    .map((img) => (img.startsWith('http') ? img : absoluteUrl(img)))
    .filter(Boolean)
    .slice(0, 1)

  const ogImage = ogImages[0] || SITE_OG_IMAGE

  return {
    title: `${property.title} | ${SITE.name}`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: property.title,
      description,
      url: pageUrl,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  const isProj = property.propertyType?.toUpperCase() === 'RESIDENTIAL_PROJECT' ||
                 property.propertyType?.toUpperCase() === 'COMMERCIAL_PROJECT' ||
                 property.propertyType?.toUpperCase() === 'RESIDENTIAL PROJECT' ||
                 property.propertyType?.toUpperCase() === 'COMMERCIAL PROJECT';

  if (!isProj) {
    redirect(`/property/${params.id}`)
  }

  const rawImages: string[] = Array.isArray(property.images)
    ? property.images
    : (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : [])

  const rawAmenities: string[] = Array.isArray(property.amenities)
    ? property.amenities
    : (typeof property.amenities === 'string' ? JSON.parse(property.amenities || '[]') : [])

  const transformedProperty = {
    ...property,
    id: String(property.id),
    description: property.description || '',
    images: rawImages.map(normalizeImage).filter(Boolean),
    amenities: rawAmenities,
    user: property.user || (property.userId ? {
      id: String(property.userId),
      name: property.userName || 'Seller',
      email: '',
      phone: property.userPhone || '',
      role: 'SELLER',
      profileImage: property.userProfileImage,
      description: property.userDescription,
      experienceYears: property.userExperienceYears,
    } : undefined),
  }

  const jsonLd = buildPropertyJsonLd({
    id: transformedProperty.id,
    title: transformedProperty.title,
    description: transformedProperty.description,
    price: transformedProperty.price,
    listingType: transformedProperty.listingType,
    propertyType: transformedProperty.propertyType,
    address: transformedProperty.address,
    city: transformedProperty.city,
    state: transformedProperty.state,
    images: transformedProperty.images,
    bhk: transformedProperty.bhk,
    area: transformedProperty.area,
    bedrooms: transformedProperty.bedrooms,
    bathrooms: transformedProperty.bathrooms,
    yearBuilt: transformedProperty.yearBuilt,
    amenities: transformedProperty.amenities,
    latitude: transformedProperty.latitude,
    longitude: transformedProperty.longitude,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <PropertyDetailContent property={transformedProperty} />
    </>
  )
}
