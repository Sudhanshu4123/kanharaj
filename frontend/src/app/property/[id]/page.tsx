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
  // Use internal backend URL for server-side rendering (Docker network)
  // Fall back to public API URL for local dev
  const internalUrl = process.env.INTERNAL_BACKEND_URL
  const baseUrl = internalUrl
    ? `${internalUrl}/api`
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api')
  try {
    const res = await fetch(`${baseUrl}/properties/${id}`, {
      next: { revalidate: 60 },
      cache: 'no-store',
    })
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
  const ogImages = rawImages
    .map(normalizeImage)
    .filter(img => img.startsWith('http')) // Only absolute URLs for OG
    .slice(0, 1)

  return {
    title: `${property.title} | Kanharaj Builder`,
    description,
    openGraph: {
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