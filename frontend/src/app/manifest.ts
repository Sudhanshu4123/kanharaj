import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Real Estate in Dwarka`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E11D48',
    lang: 'en-IN',
    orientation: 'portrait',
    categories: ['business', 'real estate'],
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
