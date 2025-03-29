import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/profile/', '/admin/']
    },
    sitemap: 'https://vazzuniverse.id/sitemap.xml',
  }
}