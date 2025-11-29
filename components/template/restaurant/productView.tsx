'use client';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Minus, Clock, Flame } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product, Store } from '@/store/useAppStore';
import RestaurantHeader from '@/components/template/restaurant/header';

interface ProductDetailsProps {
  store: Store;
  product: Product;
}

const RestaurantProductDetails: React.FC<ProductDetailsProps> = ({ store, product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { items, addItem } = useCartStore();
  const { getTotalItems } = useCartStore();

  const relatedProducts = useMemo(() => {
    if (!store.products || !Array.isArray(store.products)) return [];
    return store.products
      .filter((p: Product) => p && p._id && p._id !== product._id)
      .slice(0, 4);
  }, [store.products, product._id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: store.currency || 'USD',
    }).format(price);
  };

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images!.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) =>
        prev - 1 < 0 ? product.images!.length - 1 : prev - 1
      );
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

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Item not found.</p>
          <Link
            href={`/${store?.slug || ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white transition-colors text-sm"
            style={{ backgroundColor: store?.secondaryColor || '#d97706' }}
          >
            Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: store.primaryColor }}
    >
      <RestaurantHeader
        store={store}
        setIsCartOpen={setIsCartOpen}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <Link
            href={`/${store.slug}`}
            className="hover:underline"
            style={{ color: store.secondaryColor }}
          >
            {store.name}
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-600">{product.name}</span>
        </div>
      </nav>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
              <Image
                src={product.images?.[selectedImageIndex] || '/api/placeholder/500/500'}
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
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg md:opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                      selectedImageIndex === idx ? 'border-amber-500' : 'border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: store.secondaryColor }}
                  >
                    {product.name}
                  </h1>
                </div>
              </div>

              <p className="text-3xl font-bold" style={{ color: store.secondaryColor }}>
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Tags/Attributes */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: store.secondaryColor }}
                  >
                    {tag === 'spicy' && <Flame size={14} className="inline mr-1" />}
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center border rounded-lg overflow-hidden"
                    style={{ borderColor: store.secondaryColor }}
                  >
                    <button
                      onClick={handleDecreaseQuantity}
                      className="p-2 hover:bg-gray-100 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} style={{ color: store.secondaryColor }} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-12 text-center border-0 outline-none"
                    />
                    <button
                      onClick={handleIncreaseQuantity}
                      className="p-2 hover:bg-gray-100 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} style={{ color: store.secondaryColor }} />
                    </button>
                  </div>

                  {product.stockCount !== undefined && (
                    <p className="text-sm text-gray-500">
                      {product.stockCount - quantity} left in stock
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: store.secondaryColor }}
              >
                Add to Order
              </button>
            </div>

            {/* Availability Info */}
            {product.isAvailable === false && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-semibold">Currently Unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Items */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2
              className="text-2xl font-bold mb-8"
              style={{ color: store.secondaryColor }}
            >
              More Items
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item: Product) => (
                <Link
                  key={item._id}
                  href={`/${store.slug}/${item._id}`}
                  className="group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.images?.[0] || '/api/placeholder/300/300'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:underline">
                      {item.name}
                    </h3>
                    <p
                      className="font-bold"
                      style={{ color: store.secondaryColor }}
                    >
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default RestaurantProductDetails;
