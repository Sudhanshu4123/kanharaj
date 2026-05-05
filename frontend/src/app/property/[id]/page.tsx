import type { Metadata, ResolvingMetadata } from "next"
import PropertyDetailContent from "./PropertyDetailContent"
import { notFound } from "next/navigation"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

/** Normalize image URLs so any format works:
 *  uploads/file.jpg     → /api/uploads/file.jpg
 *  /uploads/file.jpg    → /api/uploads/file.jpg  (WebConfig handles both)
 *  /api/uploads/file.jpg → /api/uploads/file.jpg (already correct)
 *  https://...          → kept as-is (Cloudinary / Unsplash)
 */
function normalizeImage(img: string): string {
  if (!img) return ''
  if (img.startsWith('http')) return img
  if (img.startsWith('/api/uploads/') || img.startsWith('/uploads/')) return img
  if (img.startsWith('api/uploads/')) return `/${img}`
  if (img.startsWith('uploads/')) return `/api/${img}`
  return img
}

async function getProperty(id: string) {
  // For SSR, use internal Docker network if available
  const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  // Ensure the internal URL also has the /api prefix if it's pointing to the service root
  const fetchUrl = INTERNAL_BACKEND_URL?.includes('/api') 
    ? `${INTERNAL_BACKEND_URL}/properties/${id}`
    : `${INTERNAL_BACKEND_URL}/api/properties/${id}`;

  try {
    const res = await fetch(fetchUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Error fetching property:", error)
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
      title: "Property Not Found | Kanharaj Builder",
    }
  }

  // Safely get description and first image (must be absolute for OG)
  const description = property.description
    ? `${String(property.description).slice(0, 160)}...`
    : `${property.title} - Located in ${property.address || ''}, ${property.city || ''}`

  const rawImages: string[] = Array.isArray(property.images)
    ? property.images
    : (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : [])

  // For OpenGraph, we need absolute URLs only
  const baseUrl = "https://kanharaj.com"
  const ogImages = rawImages
    .map(normalizeImage)
    .map(img => img.startsWith('http') ? img : `${baseUrl}${img}`)
    .slice(0, 1)

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      url: `${baseUrl}/property/${id}`,
      siteName: "Kanharaj Builder",
      images: ogImages.map(url => ({
        url,
        width: 1200,
        height: 630,
        alt: property.title,
      })),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description,
      images: ogImages,
    },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  // Parse and normalize images and amenities
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
  }

  return <PropertyDetailContent property={transformedProperty} />
}