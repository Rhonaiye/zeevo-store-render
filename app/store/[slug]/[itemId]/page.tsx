'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Star, Instagram, Facebook, Twitter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/store/useAppStore';

interface Store {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  currency?: string;
  domain?: string;
  owner?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  isPublished?: boolean;
  products?: string[];
}

const ProductDetails: React.FC = () => {
  const params = useParams();
  const itemId = params?.itemId as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    if (!itemId) {
      setError('Invalid product ID');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${itemId}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();

        const storeData: Store = {
          name: data.store.name || 'Unknown Store',
          slug: data.store.slug,
          description: data.store.description,
          logo: data.store.logo || '/api/placeholder/100/100',
          coverImage: data.store.coverImage || '/api/placeholder/1200/400',
          primaryColor: data.store.primaryColor || '#ffffff',
          secondaryColor: data.store.secondaryColor || '#000000',
          accentColor: data.store.accentColor || '#3b82f6',
          currency: data.store.currency || 'NGN',
          domain: data.store.domain,
          owner: data.store.owner,
          socialLinks: data.store.socialLinks || {},
          contact: data.store.contact || {},
          isPublished: data.store.isPublished ?? false,
          products: data.store.products || [],
        };

        if (!storeData.isPublished) {
          throw new Error('Store is not published');
        }

        const productData: Product = {
          _id: data._id,
          name: data.name || 'Unnamed Product',
          price: data.price || 0,
          description: data.description,
          images: data.images && data.images.length > 0 ? data.images : ['/api/placeholder/400/400'],
          isAvailable: data.isAvailable ?? true,
          createdAt: data.createdAt || new Date().toISOString(),
          discountPrice: data.discountPrice,
          stockCount: data.stockCount,
          tags: data.tags || [],
        };

        setStore(storeData);
        setProduct(productData);

        if (storeData.products && storeData.products.length > 1) {
          const relatedProductIds = storeData.products
            .filter((id: string) => id !== itemId)
            .slice(0, 4);
          const relatedPromises = relatedProductIds.map((id: string) =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${itemId}`).then((res) => {
              if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
              return res.json();
            })
          );
          const relatedData = await Promise.all(relatedPromises);
          const relatedProductsData: Product[] = relatedData.map((item: any) => ({
            _id: item._id,
            name: item.name || 'Unnamed Product',
            price: item.price || 0,
            description: item.description,
            images: item.images && item.images.length > 0 ? item.images : ['/api/placeholder/400/400'],
            isAvailable: item.isAvailable ?? true,
            createdAt: item.createdAt || new Date().toISOString(),
            discountPrice: item.discountPrice,
            stockCount: item.stockCount,
            tags: item.tags || [],
          }));
          setRelatedProducts(relatedProductsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: store?.currency || 'NGN',
    }).format(price);
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={20} />;
      case 'facebook':
        return <Facebook size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      default:
        return null;
    }
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">{error || 'Product or store not found.'}</p>
          <Link
            href={`/${store?.slug || ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200/50"
        style={{ backgroundColor: `${store.primaryColor}f0` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {store.logo && (
                <div className="relative w-10 h-10">
                  <Image
                    src={store.logo}
                    alt="Logo"
                    fill
                    className="rounded-full object-cover"
                    quality={40}
                  />
                </div>
              )}
              <h1
                className="text-2xl font-bold"
                style={{ color: store.secondaryColor }}
              >
                {store.name}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ShoppingBag size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <Link 
            href={`/`} 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </nav>

      {/* Product Details Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={product.images?.[selectedImageIndex] || '/api/placeholder/400/400'}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover"
                priority
                quality={70}
              />

              
              {/* Navigation arrows for multiple images */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={5}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: store.secondaryColor }}>
              {product.name}
            </h1>



            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-2xl md:text-3xl font-semibold" style={{ color: store.secondaryColor }}>
                {formatPrice(product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.discountPrice)}
                </span>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: store.secondaryColor }}
                disabled={!product.isAvailable || (product.stockCount !== undefined && product.stockCount <= 0)}
              >
                {product.isAvailable && (product.stockCount === undefined || product.stockCount > 0)
                  ? 'Add to Cart'
                  : 'Out of Stock'}
              </button>
              <button
                className="p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                <Heart size={20} className="text-gray-600" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Availability: {product.isAvailable ? 'Available' : 'Out of Stock'}</li>
                {product.stockCount !== undefined && <li>Stock Count: {product.stockCount}</li>}
                <li>Product ID: {product._id}</li>
                <li>Added: {new Date(product.createdAt).toLocaleDateString()}</li>
                <li>Shipping: Free shipping on orders over {formatPrice(50000)}</li>
                {product.images && <li>Images: {product.images.length} photo{product.images.length !== 1 ? 's' : ''} available</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8" style={{ color: store.secondaryColor }}>
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={relatedProduct.images?.[0] || '/api/placeholder/400/400'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-light text-xs md:text-base mb-1 line-clamp-2 text-gray-900">
                      {relatedProduct.name}
                    </h3>
                    <span className="text-sm md:text-lg font-semibold" style={{ color: store.secondaryColor }}>
                      {formatPrice(relatedProduct.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: store.secondaryColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Store Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {store.logo && (
                  <div className="relative w-8 h-8">
                    <Image
                      src={store.logo}
                      alt="Logo"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold">{store.name}</h3>
              </div>
              {store.description && (
                <p className="text-gray-200 mb-4">{store.description}</p>
              )}
            </div>

            {/* Contact Info */}
            {store.contact && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact</h4>
                <div className="space-y-2 text-gray-200">
                  {store.contact.email && <p>Email: {store.contact.email}</p>}
                  {store.contact.phone && <p>Phone: {store.contact.phone}</p>}
                  {store.contact.address && <p>Address: {store.contact.address}</p>}
                </div>
              </div>
            )}

            {/* Social Links */}
            {store.socialLinks && Object.values(store.socialLinks).some(link => link) && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {Object.entries(store.socialLinks).map(([platform, link]) =>
                    link && (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-black bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                      >
                        {getSocialIcon(platform)}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-gray-200">
            <p>© 2025 {store.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;