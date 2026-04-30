import type { Metadata, ResolvingMetadata } from "next"
import PropertyDetailContent from "./PropertyDetailContent"
import { notFound } from "next/navigation"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getProperty(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  try {
    const res = await fetch(`${baseUrl}/properties/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Error fetching property for metadata:", error)
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

  return {
    title: `${property.title} | Kanharaj Builder`,
    description: `${property.description.slice(0, 160)}... Located in ${property.address}, ${property.city}. Price: ₹${property.price}.`,
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images && property.images.length > 0 ? [property.images[0]] : [],
    },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id)

  if (!property) {
    notFound()
  }

  // Transform data to match client-side Property interface if needed
  const transformedProperty = {
    ...property,
    id: String(property.id),
    images: typeof property.images === 'string' ? JSON.parse(property.images) : property.images,
    amenities: typeof property.amenities === 'string' ? JSON.parse(property.amenities) : property.amenities,
  }

  return <PropertyDetailContent property={transformedProperty} />
}