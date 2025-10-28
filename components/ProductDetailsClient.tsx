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

type Props = {
  initialProduct?: Product | null;
  initialStore?: Store | null;
};

export const ProductDetails: React.FC<Props> = ({ initialProduct = null, initialStore = null }) => {
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

    // If initial data was provided from the server, use it and skip client fetch
    if (initialProduct && initialStore) {
      setProduct(initialProduct);
      setStore(initialStore);
      setIsLoading(false);
      hasFetched.current = true;
      return;
    }

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
      setIsCartOpen(true); // Open cart after adding
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
    <div style={{ fontFamily: store.font }} className="min-h-screen bg-gray-50">
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
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Home
          </Link>
         
          <span className="text-gray-400">/</span>
          <Link
            href={`/${store.slug}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {store.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 max-sm:pt-5 pb-16 pt-10 lg:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery */}
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover hover:scale-110 transition-transform"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-2xl font-bold text-gray-900">
                  {product.discountPrice ? (
                    <>
                      <span className="text-indigo-600">{formatPrice(product.discountPrice)}</span>
                      <span className="text-lg text-gray-500 line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span>{formatPrice(product.price)}</span>
                  )}
                </div>
                {product.stockCount !== undefined && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.stockCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockCount > 0 ? `In stock (${product.stockCount})` : 'Out of stock'}
                  </span>
                )}
              </div>
            </div>

            <div className="prose max-w-none text-gray-600">
              <p>{product.description}</p>
            </div>

            {product.isAvailable && product.stockCount !== undefined && product.stockCount > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={handleDecreaseQuantity}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} className="text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityInputChange}
                      min={1}
                      max={product.stockCount}
                      className="w-16 text-center border-0 bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={handleIncreaseQuantity}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      disabled={quantity >= product.stockCount}
                    >
                      <Plus size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg"
                  disabled={!product.isAvailable}
                >
                  <ShoppingBag size={20} />
                  Add to Cart
                </button>

                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                  <Heart size={20} className="text-red-500" />
                  Add to Wishlist
                </button>
              </div>
            )}

            {!product.isAvailable && (
              <div className="text-center py-8">
                <p className="text-gray-500">This product is currently unavailable.</p>
              </div>
            )}

            {/* Shipping Info */}
            {store.shipping?.enabled && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={20} className="text-blue-600" />
                  <h3 className="font-medium text-blue-900">Shipping Information</h3>
                </div>
                <p className="text-sm text-blue-800">
                  Free shipping on orders over {formatPrice(5000)}. Estimated delivery: 3-5 days.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Policies Accordion */}
        {store.policies && Object.keys(store.policies).length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Store Policies</h2>
            <div className="space-y-2">
              {Object.entries(store.policies).map(([key, value]) => (
                <div key={key} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => togglePolicy(key)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <span className="font-medium text-gray-900 capitalize">{key}</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${openPolicy === key ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openPolicy === key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-sm text-gray-600">
                          <p>{value as string}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/${store.slug}/${relatedProduct._id}`}
                  className="group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-md group-hover:shadow-lg transition-shadow">
                    <Image
                      src={relatedProduct.images?.[0] || '/api/placeholder/200/200'}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-indigo-600 font-medium mt-1">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Social Links */}
      {store.socialLinks && Object.keys(store.socialLinks).length > 0 && (
        <div className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {Object.entries(store.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
                    <Image
                      src="/api/placeholder/80/80"
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      <p className="text-indigo-600 font-medium">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total: {formatPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
              </div>
              <Link
                href={`/${store.slug}/checkout`}
                className="block w-full text-center py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                onClick={() => setIsCartOpen(false)}
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        )}
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCartOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};