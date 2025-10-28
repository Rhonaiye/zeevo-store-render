'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Instagram, Facebook, Twitter, Loader2, ChevronLeft, ChevronRight, Truck, MapPin, FileText, ChevronDown, X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product, Store } from '@/store/useAppStore';
import Header from '@/components/template/modernStore/header';
import HeaderSleek from '@/components/template/sleek/header';

const ProductDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.itemId as string | undefined;
  const slug = params?.slug as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const hasFetched = useRef(false); // Track if fetch has run

  const { items, addItem, removeItem } = useCartStore();
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    // Debug: Log params and API base URL
    console.log('useParams output:', params);
    console.log('itemId:', itemId);
    console.log('slug:', slug);
    console.log('Current pathname:', window.location.pathname);
    console.log('API base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

    // Prevent multiple fetches
    if (hasFetched.current) {
      console.log('Fetch skipped: Already executed');
      return;
    }

    if (!itemId || !slug) {
      const errorMsg = `Invalid parameters: itemId=${itemId || 'undefined'}, slug=${slug || 'undefined'}`;
      console.error(errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      router.push(slug ? `/${slug}` : '/');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Executing product fetch'); // Debug: Confirm fetch
        hasFetched.current = true; // Mark fetch as complete
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${itemId}`;
        console.log('Fetching product from:', apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Product not found (status: ${response.status})`);
        }
        const data = await response.json();
        console.log('API response:', data);

        const storeData: Store = {
          _id: data.store._id,
          name: data.store.name || 'Unknown Store',
          slug: data.store.slug,
          description: data.store.description,
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
          tags: Array.isArray(data.tags) ? data.tags : [],
        };

        setStore(storeData);
        setProduct(productData);

        // Fetch related products only if storeData.products is valid
        if (Array.isArray(storeData.products) && storeData.products.length > 0) {
          console.log('storeData.products:', storeData.products); // Debug: Log products array
          const relatedProductIds = storeData.products
            .filter((product: Product) => product && product._id && product._id !== itemId)
            .slice(0, 4)
            .map((product: Product) => product._id);

          console.log('Fetching related products:', relatedProductIds);

          if (relatedProductIds.length === 0) {
            console.log('No valid related product IDs found');
            return;
          }

          const relatedPromises = relatedProductIds.map((id: string) =>
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${id}`)
              .then((res) => {
                if (!res.ok) {
                  console.warn(`Failed to fetch related product ${id}: ${res.status}`);
                  return null;
                }
                return res.json();
              })
              .catch((err) => {
                console.warn(`Error fetching related product ${id}:`, err.message);
                return null;
              })
          );

          const relatedData = await Promise.all(relatedPromises);
          console.log('Related products response:', relatedData);

          const relatedProductsData: Product[] = relatedData
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .map((item: any) => ({
              _id: item._id,
              name: item.name || 'Unnamed Product',
              price: item.price || 0,
              description: item.description,
              images: item.images && item.images.length > 0 ? item.images : ['/api/placeholder/400/400'],
              isAvailable: item.isAvailable ?? true,
              createdAt: item.createdAt || new Date().toISOString(),
              discountPrice: item.discountPrice,
              stockCount: item.stockCount,
              tags: Array.isArray(item.tags) ? item.tags : [],
            }));

          setRelatedProducts(relatedProductsData);
        } else {
          console.log('No related products available or invalid products array');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred while fetching product data';
        console.error('Fetch error:', errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup to reset hasFetched on unmount
    return () => {
      hasFetched.current = false;
    };
  }, [itemId, slug, router]);

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

  const togglePolicy = (policy: string) => {
    setOpenPolicy(openPolicy === policy ? null : policy);
  };

  const handleQuantityChange = (item: typeof items[0], delta: number) => {
    if (delta < 0 && item.quantity <= 1) {
      removeItem(item.id);
    } else {
      addItem({ ...item, quantity: delta });
    }
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      if (product && product.stockCount !== undefined && value > product.stockCount) {
        setQuantity(product.stockCount);
      } else {
        setQuantity(value);
      }
    } else {
      setQuantity(1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (product && product.stockCount !== undefined && quantity >= product.stockCount) {
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product && store) {
      addItem({
        id: product._id,
        title: product.name,
        price: product.price,
        quantity: quantity,
        storeId: store.slug,
      });
      setQuantity(1);
    }
  };

  const cartItems = items.filter((item) => item.storeId === store?.slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600 text-sm">Loading product details...</p>
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        fontFamily: store.font, 
        backgroundColor: store.primaryColor,
        color: store.secondaryColor
      }} 
      className="min-h-screen"
    >
      {
        store.template === 'modernStore' ? (
          <Header
            store={store}
            setIsCartOpen={setIsCartOpen}
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
          />
        ) : (
          <HeaderSleek
            name={store.name}
            logo={store.logo}
            storeSlug={store.slug}
            primaryColor={store.primaryColor}
            secondaryColor={store.secondaryColor}
            getTotalItems={getTotalItems}
            setIsCartOpen={setIsCartOpen}
          />
        )
      }

      <nav className="max-w-7xl mx-auto px-4 py-4 lg:pt-2.5 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <Link 
            href="/" 
            className="hover:underline"
            style={{ color: store.secondaryColor }}
          >
            Home
          </Link>
         
          <span>/</span>
          <span className="font-medium">{product.name}</span>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 max-sm:pt-5 pb-16 pt-10 lg:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={product.images?.[selectedImageIndex] || '/api/placeholder/400/400'}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                fill
                className="object-cover"
                priority
                quality={70}
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>
                </>
              )}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>
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
                      quality={50}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: store.secondaryColor }}>
              {product.name}
            </h1>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: store.primaryColor,
                      color: store.secondaryColor
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4">
              {product.discountPrice ? (
                <>
                  <span className="text-2xl md:text-3xl font-semibold" style={{ color: store.secondaryColor }}>
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-md line-through" style={{ color: store.secondaryColor }}>
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl md:text-3xl font-semibold" style={{ color: store.secondaryColor }}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: store.secondaryColor }}>Description</h3>
                <p className="text-sm leading-relaxed" style={{ color: store.secondaryColor }}>{product.description}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  backgroundColor: store.secondaryColor,
                  color: store.primaryColor 
                }}
                disabled={!product.isAvailable || (product.stockCount !== undefined && product.stockCount <= 0)}
              >
                {product.isAvailable && (product.stockCount === undefined || product.stockCount > 0)
                  ? 'Add to Cart'
                  : 'Out of Stock'}
              </button>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleDecreaseQuantity}
                  style={{ color: store.secondaryColor }}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  className="w-10 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max={product.stockCount !== undefined ? product.stockCount : undefined}
                  aria-label="Quantity"
                  style={{ color: store.secondaryColor }}
                />
                <button
                  onClick={handleIncreaseQuantity}
                  style={{ color: store.secondaryColor }}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                  disabled={product.stockCount !== undefined && quantity >= product.stockCount}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: store.secondaryColor }}>Product Details</h3>
              <ul className="list-disc list-inside text-sm space-y-1" style={{ color: store.secondaryColor }}>
                <li>Availability: {product.isAvailable ? 'Available' : 'Out of Stock'}</li>
                {product.stockCount !== undefined && <li>Stock Count: {product.stockCount}</li>}
              </ul>
            </div>
            {store.policies && (store.policies.returns || store.policies.terms) && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2" style={{ color: store.secondaryColor }}>
                  <FileText size={20} /> Policies
                </h3>
                <div className="space-y-2">
                  {store.policies.returns && (
                    <div 
                      className="rounded-lg shadow-sm border border-gray-200"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      <button
                        onClick={() => togglePolicy('returns')}
                        className="w-full p-3 flex justify-between items-center text-sm font-medium"
                        style={{ color: store.secondaryColor }}
                      >
                        Returns
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${openPolicy === 'returns' ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openPolicy === 'returns' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="p-3 text-sm" style={{ color: store.secondaryColor }}>{store.policies.returns}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {store.policies.terms && (
                    <div 
                      className="rounded-lg shadow-sm border border-gray-200"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      <button
                        onClick={() => togglePolicy('terms')}
                        className="w-full p-3 flex justify-between items-center text-sm font-medium"
                        style={{ color: store.secondaryColor }}
                      >
                        Terms
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${openPolicy === 'terms' ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openPolicy === 'terms' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="p-3 text-sm" style={{ color: store.secondaryColor }}>{store.policies.terms}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8" style={{ color: store.secondaryColor }}>
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/${relatedProduct._id}`} // Matches rewrite format
                  className="group rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  style={{ backgroundColor: store.primaryColor }}
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
                    <h3 className="font-semibold truncate" style={{ color: store.secondaryColor }}>{relatedProduct.name}</h3>
                    <p className="text-sm" style={{ color: store.secondaryColor }}>
                      {relatedProduct.discountPrice
                        ? formatPrice(relatedProduct.discountPrice)
                        : formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {store.socialLinks && Object.keys(store.socialLinks).length > 0 && (
        <footer className="border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-4">
                {Object.entries(store.socialLinks).map(([platform, url]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                      style={{ color: store.secondaryColor }}
                    >
                      {getSocialIcon(platform)}
                    </a>
                  )
                ))}
              </div>
              <p className="text-sm" style={{ color: store.secondaryColor }}>
                &copy; {new Date().getFullYear()} {store.name}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 shadow-2xl z-50"
            style={{ 
              backgroundColor: store.primaryColor,
              color: store.secondaryColor 
            }}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-center">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={product?.images?.[0] || '/api/placeholder/100/100'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">{item.title}</h3>
                          <p className="text-sm">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    className="w-full py-3 rounded-lg font-semibold"
                    style={{ 
                      backgroundColor: store.secondaryColor,
                      color: store.primaryColor 
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;