import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kindee-vocab.vercel.app'

  // 1. Static main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/games`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // 2. Dynamic category pages from Supabase (e.g. /learn/oxford3000, /learn/business, etc.)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { data: tags } = await supabase.from('public_tags').select('name')

      if (tags && tags.length > 0) {
        const categoryRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
          url: `${baseUrl}/learn/${encodeURIComponent(tag.name)}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        }))
        return [...staticRoutes, ...categoryRoutes]
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
  }

  return staticRoutes
}
