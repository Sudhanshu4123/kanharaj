import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kanharaj.com'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kanharaj.com/api'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    // Fetch all properties to add to sitemap
    const res = await fetch(`${apiUrl}/properties?size=100`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const properties = data.content || (Array.isArray(data) ? data : [])

    const propertyPages: MetadataRoute.Sitemap = properties.map((p: any) => ({
      url: `${baseUrl}/property/${p.id}`,
      lastModified: new Date(p.updatedAt || p.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticPages, ...propertyPages]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return staticPages
  }
}
