import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kanharaj.com' // Replace with your actual production domain

  const staticRoutes = [
    '',
    '/properties',
    '/properties?listing=buy',
    '/properties?listing=rent',
    '/about',
    '/contact',
    '/login',
    '/properties/post',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return [
    ...staticRoutes,
    // Future: You can also fetch all dynamic property IDs from your database here
    // and add them as { url: `${baseUrl}/property/${id}`, ... }
  ]
}
