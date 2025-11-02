'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Instagram, Facebook, Twitter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Plus, Minus, Phone, Mail, MapPin, Truck, FileText, Share2, Pause, Play } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product, Store } from '@/store/useAppStore';
import Header from '@/components/template/modernStore/header';
import HeaderSleek from '@/components/template/sleek/header';
import Footer from './footer';

interface ProductDetailsProps {
  store: Store;
  product: Product;
}

const SleekProductDetails: React.FC<ProductDetailsProps> = ({ store, product }) => {
  const relatedProductsList = useMemo(() => {
    if (!store.products || !Array.isArray(store.products)) return [];
    return store.products
      .filter((p: Product) => p && p._id && p._id !== product._id)
      .slice(0, 4);
  }, [store.products, product._id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { items, addItem, removeItem } = useCartStore();
  const { getTotalItems } = useCartStore();

  // Slideshow logic
  useEffect(() => {
    if (!product.images || product.images.length <= 1 || !isSlideshowPlaying) {
      if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
      return;
    }

    slideshowIntervalRef.current = setInterval(() => {
      setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
    }, 4000); // 4s interval

    return () => {
      if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
    };
  }, [product.images, isSlideshowPlaying]);

  const pauseSlideshow = () => {
    setIsSlideshowPlaying(false);
  };

  const toggleSlideshow = () => {
    setIsSlideshowPlaying(!isSlideshowPlaying);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: store.currency || 'NGN',
    }).format(price);
  };



  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
      pauseSlideshow();
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images!.length) % product.images!.length);
      pauseSlideshow();
    }
  };

  const togglePolicy = (policy: string) => {
    setOpenPolicy(openPolicy === policy ? null : policy);
  };

  const handleQuantityChange = (item: typeof items[0], delta: number) => {
    if (delta < 0 && item.quantity <= 1) {
      removeItem(item.id);
    } else {
      addItem({ ...item, quantity: item.quantity + delta });
    }
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      if (product.stockCount !== undefined && value > product.stockCount) {
        setQuantity(product.stockCount);
      } else {
        setQuantity(value);
      }
    } else {
      setQuantity(1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (product.stockCount !== undefined && quantity >= product.stockCount) {
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
    addItem({
      id: product._id,
      title: product.name,
      price: product.price,
      quantity: quantity,
      storeId: store.slug,
    });
    setQuantity(1);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} - ${store.name}`,
      text: product.description ? `${product.description.substring(0, 100)}...` : product.name,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error sharing:', error);
        }
      
      }
    } else {
       return null
    }
  };

  const fallbackCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Optional: Show a brief success message (e.g., via toast, but keeping it simple here)
      alert('Link copied to clipboard!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error copying URL:', error);
        // Ultimate fallback: prompt the user
        prompt('Could not copy URL. Please copy this manually:', window.location.href);
      }
    }
  };

  const cartItems = items.filter((item) => item.storeId === store.slug);

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Product or store not found.</p>
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

      <nav className="max-w-7xl mx-auto px-4 py-3 border-b border-gray-200/30">
        <div className="flex items-center space-x-2 text-sm">
          <Link 
            href={`/${store.slug}`} 
            className="hover:underline flex items-center gap-1.5"
            style={{ color: store.secondaryColor }}
          >
            <Image
              src={store.logo || '/api/placeholder/24/24'}
              alt={store.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="hidden sm:inline">{store.name}</span>
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 max-sm:pt-4 pb-16 pt-8 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Compact Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images?.[selectedImageIndex] || '/api/placeholder/400/400'}
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={selectedImageIndex === 0}
                    quality={80}
                  />
                </motion.div>
              </AnimatePresence>
              {product.images && product.images.length > 1 && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevImage}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/95 hover:bg-white rounded-full shadow-md transition-all z-10"
                  >
                    <ChevronLeft size={16} className="text-gray-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextImage}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/95 hover:bg-white rounded-full shadow-md transition-all z-10"
                  >
                    <ChevronRight size={16} className="text-gray-700" />
                  </motion.button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
                    <span>{selectedImageIndex + 1}</span>
                    <span>/ {product.images.length}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={toggleSlideshow}
                      className="ml-1 p-0.5 rounded hover:bg-white/20"
                    >
                      {isSlideshowPlaying ? <Pause size={10} /> : <Play size={10} />}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
                {product.images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      pauseSlideshow();
                    }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 snap-center transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200/30 shadow-md'
                        : 'border-transparent hover:border-gray-300/50'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={60}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Organized Product Details Section - Now includes sidebar content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Product Name - Full Width */}
            <div className="w-full space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: store.secondaryColor }}>
                {product.name}
              </h1>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 w-full">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-sm rounded border border-gray-300/30"
                      style={{ 
                        backgroundColor: store.primaryColor + '15',
                        color: store.secondaryColor + 'CC'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Product Description - Full Width, Expandable */}
            {product.description && (
              <div className="w-full space-y-2">
                <div 
                  className={`text-base lg:text-lg leading-relaxed prose prose-sm lg:prose-base max-w-none opacity-90 ${
                    isDescriptionExpanded ? '' : 'line-clamp-4'
                  }`}
                  style={{ color: store.secondaryColor }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
                {!isDescriptionExpanded && product.description.length > 200 && (
                  <button
                    onClick={toggleDescription}
                    className="text-sm font-medium underline hover:no-underline flex items-center gap-1"
                    style={{ color: store.secondaryColor }}
                  >
                    Read more
                    <ChevronDown size={14} className="transition-transform" />
                  </button>
                )}
                {isDescriptionExpanded && (
                  <button
                    onClick={toggleDescription}
                    className="text-sm font-medium underline hover:no-underline flex items-center gap-1"
                    style={{ color: store.secondaryColor }}
                  >
                    Show less
                    <ChevronUp size={14} className="transition-transform" />
                  </button>
                )}
              </div>
            )}

            {/* Price - Full Width */}
            <div className="w-full flex items-center justify-between">
              <div className="space-y-1">
                {product.discountPrice ? (
                  <>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold block" style={{ color: store.secondaryColor }}>
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-sm lg:text-base line-through opacity-60" style={{ color: store.secondaryColor }}>
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold" style={{ color: store.secondaryColor }}>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100/30 transition-colors" style={{ color: store.secondaryColor }}>
                <Heart size={20} className="fill-current stroke-current" />
              </button>
            </div>

            {/* Actions - Full Width */}
            <div className="w-full space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 text-base"
                  style={{ 
                    backgroundColor: store.secondaryColor,
                    color: store.primaryColor 
                  }}
                  disabled={!product.isAvailable || (product.stockCount !== undefined && product.stockCount <= 0)}
                >
                  {product.isAvailable && (product.stockCount === undefined || product.stockCount > 0)
                    ? (
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingBag size={16} />
                        Add to Cart
                      </span>
                    )
                    : 'Out of Stock'}
                </motion.button>
                <div className="flex items-center gap-1.5 bg-gray-50/30 p-1.5 rounded-xl min-w-[90px] justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleDecreaseQuantity}
                    className="p-1 rounded border border-gray-300/30 hover:bg-gray-100/30"
                    disabled={quantity <= 1}
                  >
                    <Minus size={14} />
                  </motion.button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityInputChange}
                    className="w-8 text-center text-base font-medium border-0 bg-transparent focus:ring-0"
                    style={{ color: store.secondaryColor }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleIncreaseQuantity}
                    className="p-1 rounded border border-gray-300/30 hover:bg-gray-100/30"
                    disabled={product.stockCount !== undefined && quantity >= product.stockCount}
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-base opacity-80 pt-1" style={{ color: store.secondaryColor }}>
                <span className="flex items-center gap-1 flex-1">
                  <Truck size={14} />
                  {product.isAvailable ? 'Ships in 1-2 days' : 'Out of Stock'}
                </span>
                {product.stockCount !== undefined && (
                  <span className="flex items-center gap-1 flex-1">
                    <Heart size={14} />
                    {product.stockCount} left
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100/30 transition-colors flex items-center gap-1 text-base"
                  style={{ color: store.secondaryColor }}
                >
                  <Share2 size={16} />
                  Share
                </motion.button>
              </div>
            </div>

            {/* Store Info & Links */}
            <div className="p-3 rounded-xl border border-gray-200/30 bg-gradient-to-br from-white/20 to-transparent space-y-3">
              <h3 className="text-base font-semibold mb-2 flex items-center gap-1.5" style={{ color: store.secondaryColor }}>
                <img src={store.logo || '/api/placeholder/20/20'} alt="" className="w-4 h-4 rounded" />
                {store.name}
              </h3>
              <div className="space-y-1.5 text-base opacity-80" style={{ color: store.secondaryColor }}>
                {store.contact?.email && (
                  <Link href={`mailto:${store.contact.email}`} className="flex items-center gap-1.5 hover:underline">
                    <Mail size={14} />{store.contact.email}
                  </Link>
                )}
                {store.contact?.phone && (
                  <Link href={`tel:${store.contact.phone}`} className="flex items-center gap-1.5 hover:underline">
                    <Phone size={14} />{store.contact.phone}
                  </Link>
                )}
              </div>
            </div>

            {/* Shipping Details */}
            {store.shipping && Array.isArray(store.shipping.locations) && store.shipping.locations.length > 0 && (
              <div className="p-3 rounded-xl border border-gray-200/30 bg-gradient-to-br from-white/10 to-transparent">
                <h4 className="text-base font-semibold mb-2 flex items-center gap-1" style={{ color: store.secondaryColor }}>
                  <Truck size={14} />
                  Shipping
                </h4>
                <ul className="space-y-1 text-base">
                  {store.shipping.locations.slice(0, 2).map((loc, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span className="truncate">{loc.area}</span>
                      <span className="font-medium">{formatPrice(loc.fee)}</span>
                    </li>
                  ))}
                  {store.shipping.locations.length > 2 && (
                    <li className="text-sm opacity-70">...and more</li>
                  )}
                </ul>
              </div>
            )}

            {/* Policies - Collapsible */}
            <div className="space-y-1.5">
              {store.policies?.returns && (
                <motion.div 
                  initial={false}
                  animate={{ height: openPolicy === 'returns' ? 'auto' : 0 }}
                  className="overflow-hidden rounded-lg border border-gray-200/30 bg-gradient-to-br from-white/10 to-transparent"
                >
                  <button
                    onClick={() => togglePolicy('returns')}
                    className="w-full p-2 flex justify-between items-center text-base font-medium"
                    style={{ color: store.secondaryColor }}
                  >
                    Returns
                    <ChevronDown size={14} className={`transition-transform ${openPolicy === 'returns' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openPolicy === 'returns' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="px-2 pb-2 text-base leading-tight"
                        style={{ color: store.secondaryColor }}
                      >
                        {store.policies.returns}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {store.policies?.terms && (
                <motion.div 
                  initial={false}
                  animate={{ height: openPolicy === 'terms' ? 'auto' : 0 }}
                  className="overflow-hidden rounded-lg border border-gray-200/30 bg-gradient-to-br from-white/10 to-transparent"
                >
                  <button
                    onClick={() => togglePolicy('terms')}
                    className="w-full p-2 flex justify-between items-center text-base font-medium"
                    style={{ color: store.secondaryColor }}
                  >
                    Terms
                    <ChevronDown size={14} className={`transition-transform ${openPolicy === 'terms' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openPolicy === 'terms' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="px-2 pb-2 text-base leading-tight"
                        style={{ color: store.secondaryColor }}
                      >
                        {store.policies.terms}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer
               name={store.name}
               logo={store.logo}
               secondaryColor={store.secondaryColor}
               contact={store.contact}
               socialLinks={store.socialLinks}
               policies={store.policies}
             />

    </div>
  );
};

export default SleekProductDetails;