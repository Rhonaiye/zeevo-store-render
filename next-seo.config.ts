// seo.config.ts
import { DefaultSeoProps } from 'next-seo'

const SEOConfig: DefaultSeoProps = {
  title: 'Zeevo — Create Your Online Store in Minutes',
  titleTemplate: '%s | Zeevo',
  defaultTitle: 'Zeevo — Create Your Online Store in Minutes',
  description:
    'Zeevo lets you build and manage your online store easily. Sell products, accept payments, and grow your business with powerful e-commerce tools.',
  canonical: 'https://zeevo.shop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zeevo.shop',
    siteName: 'Zeevo',
    images: [
      {
        url: 'https://zeevo.shop/zeevo-fb.png', // Your default OG image
        width: 1200,
        height: 630,
        alt: 'Zeevo — Create Your Online Store in Minutes',
      },
    ],
  },
  twitter: {
    handle: '@ZeevoHQ',
    site: '@ZeevoHQ',
    cardType: 'summary_large_image',
  },
}

export default SEOConfig
