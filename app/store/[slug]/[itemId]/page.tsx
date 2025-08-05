'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Instagram, Facebook, Twitter, Loader2, ChevronLeft, ChevronRight, Truck, MapPin, FileText, ChevronDown, X, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product, Store } from '@/store/useAppStore';
import Header from '@/components/template/modernStore/header';

const ProductDetails: React.FC = () => {
  const params = useParams();
  const itemId = params?.itemId as string | undefined;
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore();

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
          products: data.store.products || [],
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

        if (storeData.products && storeData.products.length > 1) {
  const relatedProductIds = storeData.products
    .filter((product: Product) => product._id !== itemId) // compare _id to itemId
    .slice(0, 4)
    .map((product: Product) => product._id); // extract _id for fetch

  const relatedPromises = relatedProductIds.map((id: string) =>
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/product/by-id/${id}`).then((res) => {
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
    tags: Array.isArray(item.tags) ? item.tags : [],
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
      setQuantity(1); // Reset quantity after adding to cart
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
    <div style={{fontFamily: store.font}} className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        store={store}
        setIsCartOpen={setIsCartOpen}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

    

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
               {product.discountPrice && (
                <span className="text-2xl md:text-3xl font-semibold" style={{ color: store.secondaryColor }}>
                  {formatPrice(product.discountPrice)}
                </span>
              )}
              <span className="text-md text-gray-500 line-through" >
                {formatPrice(product.price)}
              </span>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4">

               <button
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: store.secondaryColor }}
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
                  readOnly
                  className="w-10 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  min="1"
                  max={product.stockCount !== undefined ? product.stockCount : undefined}
                  aria-label="Quantity"
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Details</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                <li>Availability: {product.isAvailable ? 'Available' : 'Out of Stock'}</li>
                {product.stockCount !== undefined && <li>Stock Count: {product.stockCount}</li>}
              </ul>
            </div>

            {/* Policies */}
            {store.policies && (store.policies.returns || store.policies.terms) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText size={20} /> Policies
                </h3>
                <div className="space-y-2">
                  {store.policies.returns && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => togglePolicy('returns')}
                        className="w-full p-3 flex justify-between items-center text-sm font-medium text-gray-900"
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
                            <p className="p-3 text-sm text-gray-600">{store.policies.returns}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {store.policies.terms && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => togglePolicy('terms')}
                        className="w-full p-3 flex justify-between items-center text-sm font-medium text-gray-900"
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
                            <p className="p-3 text-sm text-gray-600">{store.policies.terms}</p>
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
                  href={`/${store.slug}/product/${relatedProduct._id}`}
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
                    <h3 className="font-light text-sm md:text-base mb-1 line-clamp-2 text-gray-900">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <p className="text-gray-200 text-sm mb-4">{store.description}</p>
              )}
            </div>

            {/* Contact Info */}
            {store.contact && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact</h4>
                <div className="space-y-2 text-gray-200 text-sm">
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

            {/* Policies */}
            {store.policies && (store.policies.returns || store.policies.terms) && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Policies</h4>
                <div className="space-y-2 text-gray-200 text-sm">
                  {store.policies.returns && (
                    <div>
                      <h5 className="font-medium">Returns</h5>
                      <p className="line-clamp-3">{store.policies.returns}</p>
                    </div>
                  )}
                  {store.policies.terms && (
                    <div>
                      <h5 className="font-medium">Terms</h5>
                      <p className="line-clamp-3">{store.policies.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white border-opacity-20 mt-8 pt-8 text-center text-gray-200 text-sm">
            <p>© 2025 {store.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetails;