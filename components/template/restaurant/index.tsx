'use client';
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, Menu, X, Plus, Minus, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Store } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';
import RestaurantHeader from './header';
import RestaurantFooter from './footer';
import RestaurantHeroSection from './heroSection';

interface RestaurantTemplateProps {
  store: Store;
  isPreview?: boolean;
}

interface MobileMenuProps {
  store: Store;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

const RestaurantMobileMenu: React.FC<MobileMenuProps> = ({
  store,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setSearchQuery,
  searchQuery,
}) => {
  const { secondaryColor = '#d97706' } = store;

  if (!isMobileMenuOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute top-0 left-0 w-3/4 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSearchQuery('');
              }}
              style={{ color: secondaryColor }}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 transition-all duration-300 placeholder-gray-400"
              aria-label="Search menu items"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const RestaurantTemplate: React.FC<RestaurantTemplateProps> = ({ store, isPreview = false }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const PRODUCTS_PER_PAGE = 6;

  const {
    name,
    slug = name.toLowerCase().replace(/\s+/g, '-'),
    description,
    logo,
    primaryColor = '#FFFFFF',
    secondaryColor = '#d97706',
    currency = 'USD',
    products = [],
    heroImage,
  } = store;

  const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedTag) {
      filtered = filtered.filter(
        (product) => product.tags && product.tags.includes(selectedTag)
      );
    }

    return filtered;
  }, [products, searchQuery, selectedTag]);

  // Get all unique tags from products
  const availableTags = useMemo(() => {
    const allTags = products.flatMap((product) => product.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.slice(0, 6);
  }, [products]);

  // Reset to first page when search query or tag changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag]);

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const cartItems = useMemo(
    () => items.filter((item) => item.storeId === slug),
    [items, slug]
  );

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product._id,
      title: product.name,
      price: product.price,
      quantity: 1,
      storeId: slug,
    });
  };

  const handleQuantityChange = (item: typeof items[0], delta: number) => {
    if (delta < 0 && item.quantity <= 1) {
      removeItem(item.id);
    } else {
      addItem({ ...item, quantity: item.quantity + delta });
    }
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.tag-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleViewMore = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      const menuSection = document.querySelector('#menu-section');
      menuSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewPrevious = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      const menuSection = document.querySelector('#menu-section');
      menuSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryColor }}>
      {/* Header */}
      <RestaurantHeader
        store={store}
        setIsCartOpen={setIsCartOpen}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Menu */}
      <RestaurantMobileMenu
        store={store}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Hero Section */}
      <RestaurantHeroSection
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        name={name}
        description={description}
        heroImage={heroImage}
      />

      {/* Menu Section */}
      <section id="menu-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: secondaryColor }}
          >
            {searchQuery
              ? `Search Results: "${searchQuery}"`
              : selectedTag
              ? `Menu: ${selectedTag}`
              : 'Our Menu'}
          </h2>
          {!searchQuery && !selectedTag && description && (
            <p className="text-gray-600 text-sm sm:text-base">{description}</p>
          )}
        </div>

        {/* Category Filter */}
        {availableTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => handleTagSelect(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedTag === null
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedTag === null ? secondaryColor : undefined,
                }}
              >
                All Items
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedTag === tag
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTag === tag ? secondaryColor : undefined,
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items Grid */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white group"
              >
                {/* Product Image */}
                <Link href={`/${slug}/${product._id}`} className="block relative">
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    href={`/${slug}/${product._id}`}
                    className="block hover:underline"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price and Add to Cart */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-lg font-bold"
                      style={{ color: secondaryColor }}
                    >
                      {formatPrice(product.price)}
                    </p>

                    {product.isAvailable ? (
                      <div className="flex items-center gap-2">
                        {cartItems.some((item) => item.id === product._id) ? (
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              onClick={() => {
                                const item = cartItems.find(
                                  (i) => i.id === product._id
                                );
                                if (item) {
                                  handleQuantityChange(item, -1);
                                }
                              }}
                              className="p-1 hover:bg-gray-100 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {
                                cartItems.find((i) => i.id === product._id)
                                  ?.quantity
                              }
                            </span>
                            <button
                              onClick={() => {
                                const item = cartItems.find(
                                  (i) => i.id === product._id
                                );
                                if (item) {
                                  handleQuantityChange(item, 1);
                                }
                              }}
                              className="p-1 hover:bg-gray-100 transition"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="p-2 rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: secondaryColor }}
                            aria-label="Add to cart"
                          >
                            <ShoppingBag size={16} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found. Try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            {hasPrevPage && (
              <button
                onClick={handleViewPrevious}
                className="px-6 py-2 rounded-lg border-2 font-semibold transition hover:opacity-80"
                style={{
                  borderColor: secondaryColor,
                  color: secondaryColor,
                }}
              >
                Previous
              </button>
            )}

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            {hasNextPage && (
              <button
                onClick={handleViewMore}
                className="px-6 py-2 rounded-lg font-semibold text-white transition hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: secondaryColor }}
              >
                Next
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <RestaurantFooter store={store} />

      {/* Cart Drawer (simplified for now) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Order</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close cart"
                >
                  <X size={24} />
                </button>
              </div>

              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.price)} x {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-800">Total:</span>
                      <p className="text-2xl font-bold" style={{ color: secondaryColor }}>
                        {formatPrice(getTotalPrice())}
                      </p>
                    </div>

                    <Link
                      href={`/${slug}/cart`}
                      className="block w-full py-3 px-4 rounded-lg font-semibold text-white text-center transition hover:opacity-90"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-600 py-8">Your order is empty</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTemplate;
