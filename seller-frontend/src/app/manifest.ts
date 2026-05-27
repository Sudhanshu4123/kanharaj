import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kanharaj Seller Dashboard',
    short_name: 'Kanharaj Seller',
    description: 'Manage listings, leads and subscription on Kanharaj',
    start_url: '/',
    display: 'standalone',
    scope: '/',
    prefer_related_applications: false,
    background_color: '#F5F7FA',
    theme_color: '#4a3b1e',
    lang: 'en-IN',
    orientation: 'portrait',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
