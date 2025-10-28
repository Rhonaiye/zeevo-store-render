import { ProductDetails as ProductDetailsClient } from '@/components/ProductDetailsClient';
import { Product, Store } from '@/store/useAppStore';

const makeAbsolute = (url: string | undefined, base: string) => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch (e) {
    if (!base) return url;
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }
};

export async function generateMetadata({ params }: any) {
  const { slug, itemId } = params as { slug: string; itemId: string };
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const res = await fetch(`${apiBase}/v1/product/by-id/${itemId}`);
    if (!res.ok) return {};
    const data = await res.json();
    const store = data.store as any;
    const baseUrl = store?.domain ? (store.domain.startsWith('http') ? store.domain : `https://${store.domain}`) : `https://${slug}.zeevo.shop`;
    const productImage = makeAbsolute(data.images?.[0] || store?.logo || '', baseUrl) || undefined;
    return {
      title: `${data.name} — ${store?.name || slug}`,
      description: data.description || store?.description || undefined,
      openGraph: {
        title: `${data.name} — ${store?.name || slug}`,
        description: data.description || store?.description || undefined,
        url: `${baseUrl.replace(/\/$/, '')}/${itemId}`,
        siteName: store?.name,
        images: productImage ? [{ url: productImage, width: 1200, height: 630, alt: data.name }] : [],
        type: 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${data.name} — ${store?.name || slug}`,
        description: data.description || store?.description || undefined,
        images: productImage ? [productImage] : [],
      },
    };
  } catch (err) {
    return {};
  }
}

export default async function Page({ params }: any) {
  const { slug, itemId } = params as { slug: string; itemId: string };
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${apiBase}/v1/product/by-id/${itemId}`);
  if (!res.ok) return <div>Product not found</div>;
  const data = await res.json();

  const storeRaw = data.store || {};
  const store: Store = {
    _id: storeRaw._id,
    name: storeRaw.name || 'Store',
    slug: storeRaw.slug || slug,
    description: storeRaw.description,
    logo: storeRaw.logo || '/api/placeholder/100/100',
    primaryColor: storeRaw.primaryColor || '#ffffff',
    secondaryColor: storeRaw.secondaryColor || '#000000',
    currency: storeRaw.currency || 'NGN',
    domain: storeRaw.domain,
    socialLinks: storeRaw.socialLinks || {},
    contact: storeRaw.contact || {},
    shipping: storeRaw.shipping || { enabled: false, locations: [] },
    pickup: storeRaw.pickup || { enabled: false },
    policies: storeRaw.policies || {},
    isPublished: storeRaw.isPublished ?? false,
    products: Array.isArray(storeRaw.products) ? storeRaw.products : [],
    createdAt: storeRaw.createdAt || new Date().toISOString(),
    template: storeRaw.template,
    font: storeRaw.font,
  };

  const baseUrl = store.domain ? (store.domain.startsWith('http') ? store.domain : `https://${store.domain}`) : `https://${slug}.zeevo.shop`;
  const product: Product = {
    _id: data._id,
    name: data.name || 'Product',
    price: data.price || 0,
    description: data.description,
    images: Array.isArray(data.images) ? data.images.map((img: string) => makeAbsolute(img, baseUrl) || img) : [],
    isAvailable: data.isAvailable ?? true,
    createdAt: data.createdAt || new Date().toISOString(),
    discountPrice: data.discountPrice,
    stockCount: data.stockCount,
    tags: Array.isArray(data.tags) ? data.tags : [],
  };

  return <ProductDetailsClient initialProduct={product} initialStore={store} />;
}