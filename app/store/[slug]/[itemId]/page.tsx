'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import SleekProductDetails from '@/components/template/sleek/productView';
import { Product, Store } from '@/store/useAppStore';

// 🔹 ScaleLoader component
const ScaleLoader = ({ slug, color = 'black' }: { slug: string; color?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{slug}</h2>
        <p className="text-gray-500 text-sm">Loading product...</p>
      </div>
      <style jsx>{`
        @keyframes scale {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
        .animate-pulse { animation: scale 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const ProductPage: React.FC = () => {
  const params = useParams();
  const itemId = params?.itemId as string;
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!itemId || !slug) return notFound();

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${itemId}`
        );
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();

        const storeData: Store = {
          _id: data.store._id,
          name: data.store.name || 'Unknown Store',
          slug: data.store.slug,
          description: data.store.description || '',
          logo: data.store.logo || '/api/placeholder/100/100',
          primaryColor: data.store.primaryColor || '#ffffff',
          secondaryColor: data.store.secondaryColor || '#000000',
          currency: data.store.currency || 'NGN',
          domain: data.store.domain,
          socialLinks: data.store.socialLinks || {},
          contact: data.store.contact || {},
          shipping: data.store.shipping || { enabled: false, locations: [] },
          pickup: data.store.pickup || { enabled: false },
          policies: data.store.policies || {},
          isPublished: data.store.isPublished ?? false,
          products: Array.isArray(data.store.products) ? data.store.products : [],
          createdAt: data.store.createdAt || new Date().toISOString(),
          template: data.store.template,
          font: data.store.font,
        };

        if (!storeData.isPublished) throw new Error('Store is not published');

        const productData: Product = {
          _id: data._id,
          name: data.name || 'Unnamed Product',
          price: data.price || 0,
          description: data.description || '',
          images:
            data.images && data.images.length > 0
              ? data.images
              : ['/api/placeholder/400/400'],
          isAvailable: data.isAvailable ?? true,
          createdAt: data.createdAt || new Date().toISOString(),
          discountPrice: data.discountPrice,
          stockCount: data.stockCount,
          tags: Array.isArray(data.tags) ? data.tags : [],
        };

        setStore(storeData);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemId, slug]);

  if (isLoading) {
    return <ScaleLoader slug={store?.name || 'Loading'} color={store?.primaryColor || 'black'} />;
  }

  if (!product || !store) return notFound();

  return <SleekProductDetails store={store} product={product} />;
};

export default ProductPage;
