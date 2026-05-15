import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kanharaj.com' // Replace with your actual production domain

  const staticRoutes = [
    '',
    '/properties',
    '/properties?listing=buy',
    '/properties?listing=rent',
    '/about',
    '/contact',
    '/for-sellers',
    '/login',
    '/forgot-password',
    '/reset-password',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Attempt to fetch properties to add to sitemap
    // Note: In production, ensure this URL is accessible from the build environment
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL}`}/properties?size=100`)
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
