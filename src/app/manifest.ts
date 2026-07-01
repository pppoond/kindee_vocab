import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kindee Vocabulary',
    short_name: 'Kindee Vocab',
    description: 'Learn vocabulary easily and effectively',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/assets/logos/logo.png',
        sizes: '192x192 512x512',
        type: 'image/png',
      },
    ],
  }
}
