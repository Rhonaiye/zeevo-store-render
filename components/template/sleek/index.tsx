'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Product } from '@/store/useAppStore';
import Header from './header';
import HeroSection from './heroSection';
import Footer from './footer';
import CartDrawer from './cartDrawer';
import { ShoppingBag, Heart, Search, Tag } from 'lucide-react';
import { Store } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface SleekStoreTemplateProps {
  store: Store;
  isPreview?: boolean;
}

const SleekStoreTemplate: React.FC<SleekStoreTemplateProps> = ({ store, isPreview = false }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { addItem: addToCart } = useCartStore();

  const {
    name,
    slug = name.toLowerCase().replace(/\s+/g, '-'),
    description,
    logo,
    heroImage,
    primaryColor = '#059669',
    secondaryColor = '#d97706',
    currency = 'USD',
    products = [],
    contact,
    socialLinks,
    policies,
  } = store;

  useEffect(() => {
    if (!Cookies) return;
    const cartData = Cookies.get('cart');
    if (!cartData) return;
    try {
      const parsedData: { storeSlug: string; items: CartItem[] } = JSON.parse(cartData);
      if (parsedData.storeSlug !== slug || !Array.isArray(parsedData.items)) {
        setCartItems([]);
        Cookies.remove('cart');
        return;
      }
      const validItems = parsedData.items.filter((item) => {
        const product = products.find((p) => p._id === item._id);
        return product && product.isAvailable && item.quantity > 0;
      });
      setCartItems(validItems);
    } catch (error) {
      setCartItems([]);
      Cookies.remove('cart');
    }
  }, [slug, products]);

  useEffect(() => {
    if (!Cookies || cartItems.length === 0) {
      Cookies.remove('cart');
      return;
    }
    const cartData = {
      storeSlug: slug,
      items: cartItems.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
    };
    Cookies.set('cart', JSON.stringify(cartData), {
      expires: 7,
      sameSite: 'Strict' as const,
      secure: process.env.NODE_ENV === 'production',
    });
  }, [cartItems, slug]);

  // Initialize search query from URL `q` param (allows header search to work)
  const searchParams = useSearchParams();
  useEffect(() => {
    try {
      const q = searchParams?.get('q') || '';
      setSearchQuery(q);
    } catch (err) {
      // ignore
    }
  }, [searchParams]);

  // Restore scroll position when returning from product page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedScroll = sessionStorage.getItem(`scroll-position-${slug}`);
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll, 10),
          behavior: 'smooth'
        });
        sessionStorage.removeItem(`scroll-position-${slug}`);
      }, 0);
    }
  }, [slug]);

  // Scroll to top of products when page changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag]);

  // Extract unique tags from products (limited to 8)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).slice(0, 8);
  }, [products]);

  const formatPrice = (price: number): string => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
  };

  
  const updateQuantity = (id: string, quantity: number): void => {
    const product = products.find((p) => p._id === id);
    if (product && product.stockCount && quantity > product.stockCount) return;
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item._id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, quantity } : item))
      );
    }
  };

  const getTotalItems = (): number => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = (): number => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts = useMemo<Product[]>(
    () => products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (product.tags && product.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    }),
    [products, searchQuery, selectedTag]
  );

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => 
    filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage),
    [filteredProducts, currentPage, productsPerPage]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
  };

  const handleProductClick = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`scroll-position-${slug}`, window.scrollY.toString());
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: primaryColor }}>
      <Header
        name={name}
        logo={logo}
        storeSlug={slug}
        secondaryColor={secondaryColor}
        primaryColor={primaryColor} 
        getTotalItems={getTotalItems}
        setIsCartOpen={setIsCartOpen}
      />
      <HeroSection name={name} heroImage={heroImage} description={description} secondaryColor={secondaryColor}/>
      <section id="products" className="max-w-6xl mx-auto max-sm:px-2 px-4 pt-10 pb-32">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {searchQuery || selectedTag 
              ? `${selectedTag ? `${selectedTag} Products` : ''}${searchQuery ? ` - "${searchQuery}"` : ''}`
              : 'Featured Products'
            }
          </h2>
          
          {/* Search Bar */}
          <div className=" max-sm:hidden relative max-w-sm mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              style={{ color: secondaryColor }}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2  border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[${primaryColor}]`}
              aria-label="Search products"
            />
          </div>

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="mb-10">
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <Tag size={16} className="text-gray-500 mr-2" />
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    !selectedTag
                      ? 'text-white shadow-lg'
                      : 'bg-transparent text-gray-700 hover:shadow-md shadow-md'
                  }`}
                  style={!selectedTag ? { 
                    backgroundColor: secondaryColor,
                    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)`
                  } : {
                    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
                    filter: 'brightness(0.95)'
                  }}
                >
                  All
                </button>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedTag === tag
                        ? 'text-white shadow-lg'
                        : 'bg-transparent text-gray-700 hover:shadow-md shadow-md'
                    }`}
                    style={selectedTag === tag ? {
                      backgroundColor: secondaryColor,
                      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)`
                    } : {
                      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
                      filter: 'brightness(0.95)'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {/* Clear filters button */}
              {(searchQuery || selectedTag) && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No products found</p>
            {(searchQuery || selectedTag) && (
              <div className="mt-2">
                <p className="text-sm">Try adjusting your search or filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm underline hover:text-gray-700"
                  style={{ color: secondaryColor }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/${product._id}`}
                  onClick={handleProductClick}
                  className="group bg-transparent border-0 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                  
                >
                  <div className="relative aspect-square">
                    {product.images && product.images.length > 0 && (
                      <img
                        src={product.images[0] || '/fallback-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                          addToCart({
                            id: product._id,
                            title: product.name,
                            price:
                              typeof product.discountPrice === 'number' &&
                              product.discountPrice !== undefined &&
                              product.discountPrice > 0
                                ? product.discountPrice
                                : (typeof product.price === 'number' && product.price !== undefined ? product.price : 0),
                            quantity: 1,
                            storeId: store.slug ?? store.name.toLowerCase().replace(/\s+/g, '-'),
                          });
                      }}
                      disabled={!product.isAvailable}
                      className="absolute hidden md:inline-block inset-x-2 bottom-2 py-1.5 text-white text-sm rounded-md hover:bg-[#c56a05] disabled:opacity-50 transition-opacity opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: secondaryColor }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-base text-gray-800 line-clamp-2">{product.name}</h3>
                    
                    {/* Product tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 mb-2">
                        {product.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{product.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {product.discountPrice ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-light text-sm line-through text-gray-400"  >
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <span className="text-sm font-bold my-0" style={{ color: store.secondaryColor }}>
                          {formatPrice(product.discountPrice)}
                        </span>
                      </div>
                    ) : (
                      <strong className="font-bold text-base" style={{ color: store.secondaryColor }}>{formatPrice(product.price)}</strong>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: secondaryColor,
                    border: `1px solid ${secondaryColor}`,
                    backgroundColor: 'transparent',
                  }}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors`}
                    style={{
                      backgroundColor: currentPage === page ? secondaryColor : 'transparent',
                      color: currentPage === page ? 'white' : secondaryColor,
                      border: `1px solid ${secondaryColor}`,
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: secondaryColor,
                    border: `1px solid ${secondaryColor}`,
                    backgroundColor: 'transparent',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <CartDrawer
        isCartOpen={isCartOpen}
        store={store}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        getTotalItems={getTotalItems}
        getTotalPrice={getTotalPrice}
        formatPrice={formatPrice}
        secondaryColor={secondaryColor}
        isPreview={isPreview}
      />

     <Footer
        name={name}
        logo={logo}
        secondaryColor={secondaryColor}
        contact={contact}
        socialLinks={socialLinks}
        policies={policies}
      />
    </div>
  );
};

export default SleekStoreTemplate;