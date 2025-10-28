import { Store, Product } from '@/store/useAppStore';
import SeoProvider from '@/components/SeoProvider';

export async function generateMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  // `params` may be a Promise in Next.js metadata API. Await it before using.
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`);
    if (!res.ok) {
      throw new Error('Failed to fetch store data');
    }
    const { data: store }: { data: Store } = await res.json();

    // Helper to produce absolute URLs for images (social crawlers need absolute URLs)
    const makeAbsolute = (path?: string, domain?: string) => {
      if (!path) return undefined;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      const base = (domain && (domain.startsWith('http://') || domain.startsWith('https://')))
        ? domain
        : (domain ? `https://${domain.replace(/(^https?:\/\/)/, '')}` : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'));
      return base.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
    };

    const baseUrl = store.domain || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const logoUrl = makeAbsolute(store.logo, store.domain || undefined);
    const heroUrl = makeAbsolute(store.heroImage, store.domain || undefined);

    return {
      title: store.name || 'Online Store',
      description: store.description || 'Welcome to our online store. Shop our curated collection of products.',
      keywords: [
        'Online Store',
        'Shop',
        'E-commerce',
        store.name,
        ...((store.products || []).map((p: Product) => p.name) || []).slice(0, 5)
      ].filter(Boolean),
      authors: [{ name: store.name, url: store.domain }],
      openGraph: {
        title: store.name,
        description: store.description || 'Welcome to our online store. Shop our curated collection of products.',
        url: store.domain || `${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')}/store/${slug}`,
        siteName: store.name,
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: logoUrl || heroUrl || `${baseUrl.replace(/\/$/, '')}/store-banner.jpg`,
            width: 1200,
            height: 1200,
            alt: `${store.name} - Store Logo`,
            type: 'image/jpeg'
          },
          ...(heroUrl ? [{
            url: heroUrl,
            width: 1200,
            height: 630,
            alt: `${store.name} - Store Banner`,
            type: 'image/jpeg'
          }] : [])
        ]
      },
      twitter: {
        card: 'summary',
        title: store.name,
        description: store.description || 'Welcome to our online store. Shop our curated collection of products.',
        creator: store.socialLinks?.twitter || undefined,
        images: [logoUrl || heroUrl || `${baseUrl.replace(/\/$/, '')}/store-banner.jpg`]
      },
      icons: {
        icon: logoUrl || `${baseUrl.replace(/\/$/, '')}/store-icon.png`,
        shortcut: logoUrl || `${baseUrl.replace(/\/$/, '')}/store-icon.png`,
        apple: logoUrl || `${baseUrl.replace(/\/$/, '')}/store-icon.png`
      }
    };
  } catch (error) {
    // Fallback metadata if we can't fetch store data
    return {
      title: 'Online Store',
      description: 'Welcome to our online store. Shop our curated collection of products.',
      openGraph: {
        title: 'Online Store',
        description: 'Welcome to our online store. Shop our curated collection of products.',
        type: 'website',
        locale: 'en_US',
      }
    };
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  // `params` can be a Promise in Next.js server components; await before use
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let storeData = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`);
    if (res.ok) {
      const { data } = await res.json();
      storeData = data;
    }
  } catch (error) {
    console.error('Error fetching store data:', error);
  }

  // Normalize image URLs to absolute so SeoProvider and social crawlers can load them
  const makeAbsolute = (path?: string, domain?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = (domain && (domain.startsWith('http://') || domain.startsWith('https://')))
      ? domain
      : (domain ? `https://${domain.replace(/(^https?:\/\/)/, '')}` : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'));
    return base.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`);
  };

  if (storeData) {
    const baseUrl = storeData.domain || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    storeData.logo = makeAbsolute(storeData.logo, storeData.domain || undefined) || undefined;
    storeData.heroImage = makeAbsolute(storeData.heroImage, storeData.domain || undefined) || undefined;
    // optionally normalize other image fields if present
  }

  return (
    <>
      <SeoProvider initialStore={storeData} />
      {children}
    </>
  );
}