'use client';
import React, { useState, useMemo } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, Plus, Minus, ArrowRight, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { Store } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';
import Header from './header';
import Footer from './footer';
import Herosection from './heroSection';

interface ModernStoreTemplateProps {
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

const MobileMenu: React.FC<MobileMenuProps> = ({
  store,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setSearchQuery,
  searchQuery,
}) => {
  const { name, primaryColor = '#0a0a0a', secondaryColor = '#6366f1' } = store;

  if (!isMobileMenuOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute top-0 left-0 w-3/4 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2
              className="text-base font-semibold text-gray-900"
              style={{ color: primaryColor }}
            >
              {name}
            </h2>
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
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 placeholder-gray-400"
              aria-label="Search products"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernStoreTemplate: React.FC<ModernStoreTemplateProps> = ({ store, isPreview = false }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const PRODUCTS_PER_PAGE = 5;

  const {
    name,
    slug = name.toLowerCase().replace(/\s+/g, '-'),
    description,
    logo,
    primaryColor = '#0a0a0a',
    secondaryColor = '#6366f1',
    currency = 'USD',
    products = [],
  } = store;

  const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedTag) {
      filtered = filtered.filter((product) => 
        product.tags && product.tags.includes(selectedTag)
      );
    }
    
    return filtered;
  }, [products, searchQuery, selectedTag]);

  // Get all unique tags from products (max 6)
  const availableTags = useMemo(() => {
    const allTags = products.flatMap(product => product.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.slice(0, 6); // Limit to 6 tags max
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
      addItem({ ...item, quantity: delta }); // Add or subtract one item
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
      setCurrentPage(prev => prev + 1);
      // Smooth scroll to top of products section
      const productsSection = document.querySelector('#products-section');
      productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewPrevious = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
      // Smooth scroll to top of products section
      const productsSection = document.querySelector('#products-section');
      productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper function to darken the primary color
  const darkenColor = (color: string, amount: number = 0.2) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Helper function to lighten the secondary color
  const lightenColor = (color: string, amount: number = 0.3) => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 - parseInt(hex.substr(0, 2), 16)) * amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 - parseInt(hex.substr(2, 2), 16)) * amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 - parseInt(hex.substr(4, 2), 16)) * amount);
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: primaryColor }}>
      {/* Header */}
      <Header
        store={store}
        // @ts-ignore
        cartItems={cartItems}
        setIsCartOpen={setIsCartOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setSearchQuery={setSearchQuery}
        getTotalItems={getTotalItems}
        isMobileMenuOpen={isMobileMenuOpen}
        searchQuery={searchQuery}
      />

      {/* Hero Section */}
     <Herosection secondaryColor={secondaryColor} description={description} name={name}/>

      {/* Products Grid */}
      <section id="products-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 
            className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3"
            style={{ color: secondaryColor }}
          >
            {searchQuery ? `"${searchQuery}"` : selectedTag ? `#${selectedTag}` : 'Featured Products'}
          </h2>
          <p 
            className="text-sm sm:text-base"
            style={{ color: secondaryColor }}
          >
            {searchQuery 
              ? `${filteredProducts.length} results found` 
              : selectedTag 
                ? `${filteredProducts.length} products with tag "${selectedTag}"`
                : 'Discover our curated set of collection'
            }
          </p>
          {totalProducts > 0 && (
            <p 
              className="text-xs sm:text-sm mt-1"
              style={{ color: lightenColor(secondaryColor, 0.4) }}
            >
              Showing {totalProducts} products
            </p>
          )}
        </div>

        {/* Tags Filter Dropdown - Left Aligned */}
        {availableTags.length > 0 && (
          <div className="mb-6 sm:mb-8 flex justify-start">
            <div className="relative tag-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-start justify-between gap-3 px-4 py-3 min-w-[200px] rounded-lg border border-white/30 hover:border-white/50 transition-all duration-300 text-sm font-medium"
                style={{ 
                  color: secondaryColor,
                  backgroundColor: darkenColor(primaryColor, 0.018)
                }}
                aria-label="Select product category"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs opacity-75">Filter by:</span>
                  <span>
                    {selectedTag ? `#${selectedTag}` : 'All Categories'}
                  </span>
                </span>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 py-2 rounded-lg border border-white/30 shadow-xl z-10 backdrop-blur-sm"
                  style={{ backgroundColor: darkenColor(primaryColor, 0.02) }}
                >

                  
                  {/* Tag Options */}
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(tag)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-white/10 transition-colors duration-200 flex items-center justify-between"
                      style={{ color: lightenColor(secondaryColor, 0.2) }}
                    >
                      <span>{tag}</span>
                      {selectedTag === tag &&  (
                        <Check className="w-4 h-4" style={{ color: secondaryColor }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag 
              className="w-10 h-10 mx-auto mb-3" 
              style={{ color: lightenColor(secondaryColor, 0.4) }}
            />
            <p 
              className="text-base sm:text-lg font-medium"
              style={{ color: lightenColor(secondaryColor, 0.6) }}
            >
              No products available
            </p>
            {searchQuery && !selectedTag && (
              <p 
                className="text-sm mt-2"
                style={{ color: lightenColor(secondaryColor, 0.5) }}
              >
                Try adjusting your search to find what you're looking for.
              </p>
            )}
            {selectedTag && !searchQuery && (
              <p 
                className="text-sm mt-2"
                style={{ color: lightenColor(secondaryColor, 0.5) }}
              >
                No products found with the tag "{selectedTag}".
              </p>
            )}
            {searchQuery && selectedTag && (
              <p 
                className="text-sm mt-2"
                style={{ color: lightenColor(secondaryColor, 0.5) }}
              >
                Try adjusting your search or removing the tag filter.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {currentProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/${product._id}`}
                  className="group rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-white/20"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {product.images ? (
                      <img
                        src={product.images[0] || '/fallback-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={!product.isAvailable}
                      className="absolute hidden md:inline-block inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 py-2 text-white font-medium rounded-lg transition-all transform opacity-0 group-hover:opacity-100 disabled:opacity-50 text-sm"
                      style={{ backgroundColor: secondaryColor }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 
                      className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-2 leading-tight" 
                      style={{ color: secondaryColor }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span 
                          className="font-bold text-base sm:text-lg" 
                          style={{ color: secondaryColor }}
                        >
                          {formatPrice(product.price)}
                        </span>
                        {typeof product.discountPrice === 'number' && product.discountPrice > 0 && (
                          <span 
                            className="text-sm line-through" 
                            style={{ color: lightenColor(secondaryColor, 0.5) }}
                          >
                            {formatPrice(product.discountPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-12">
                {/* Previous Button */}
                {hasPrevPage && (
                  <button
                    onClick={handleViewPrevious}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 text-sm font-medium"
                    style={{ color: secondaryColor }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                )}

                {/* Page Info */}
                <div 
                  className="text-sm font-medium"
                  style={{ color: lightenColor(secondaryColor, 0.4) }}
                >
                  Page {currentPage} of {totalPages}
                </div>

                {/* Next/View More Button */}
                {hasNextPage && (
                  <button
                    onClick={handleViewMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 text-sm font-medium group"
                    style={{ color: secondaryColor }}
                  >
                    View More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Mobile Menu */}
      <MobileMenu
        store={store}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* Footer */}
      <Footer store={store} />
    </div>
  );
};

export default ModernStoreTemplate;