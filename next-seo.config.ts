// seo.config.ts
import { DefaultSeoProps } from 'next-seo'

const createSEOConfig = (storeData?: {
  name?: string;
  description?: string;
  domain?: string;
  socialLinks?: Record<string, string>;
}): DefaultSeoProps => ({
  title: storeData?.name || 'Online Store',
  titleTemplate: `%s | ${storeData?.name || 'Store'}`,
  defaultTitle: storeData?.name || 'Online Store',
  description: storeData?.description || 'Welcome to our online store. Shop our products and find great deals.',
  canonical: storeData?.domain || '',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: storeData?.domain || '',
    siteName: storeData?.name || 'Online Store',
    images: [
      {
        url: '/store-banner.jpg',
        width: 1200,
        height: 630,
        alt: storeData?.name || 'Online Store',
      },
    ],
  },
  twitter: {
    handle: storeData?.socialLinks?.twitter || '',
    site: storeData?.socialLinks?.twitter || '',
    cardType: 'summary_large_image',
  },
})

export default createSEOConfig
