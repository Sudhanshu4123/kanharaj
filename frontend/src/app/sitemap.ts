import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kanharaj.com'

  // Publicly accessible static routes only
  const staticRoutes = [
    '',
    '/properties',
    '/about',
    '/contact',
    '/for-sellers',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic property routes
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties?size=100`)
    if (response.ok) {
      const data = await response.json()
      const propertyRoutes = data.content.map((prop: any) => ({
        url: `${baseUrl}/property/${prop.id}`,
        lastModified: new Date(prop.updatedAt || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      return [...staticRoutes, ...propertyRoutes]
    }
  } catch (error) {
    console.error('Failed to fetch properties for sitemap:', error)
  }

  return staticRoutes
}
