'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Star, Heart, Search, Menu, X, Plus, Minus, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Store } from '@/store/useAppStore';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  discountPrice?: number;
  stockCount?: number;
  tags?: string[];
  rating?: number;
  isSale?: boolean;
  isNew?: boolean;
  features?: string[];
}


interface ModernStoreTemplateProps {
  store: Store;
  isPreview?: boolean; // New prop to indicate preview mode
}

const ModernStoreTemplate: React.FC<ModernStoreTemplateProps> = ({ store, isPreview = false }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Load cart from cookies
  useEffect(() => {
    if (!Cookies) {
      console.error('js-cookie is not available');
      return;
    }
    const cartData = Cookies.get('cart');
    console.log('Retrieving cart from cookie:', cartData);
    if (!cartData) {
      console.log('No cart data found in cookies');
      return;
    }
    try {
      const parsedData = JSON.parse(cartData);
      console.log('Parsed cart data:', parsedData);
      if (parsedData.storeSlug !== slug || !Array.isArray(parsedData.items)) {
        console.log('Invalid cart data or store slug mismatch, initializing empty cart');
        setCartItems([]);
        Cookies.remove('cart');
        return;
      }
      const validItems = parsedData.items.filter((item: CartItem) => {
        const product = products.find((p) => p._id === item._id);
        return product && product.isAvailable && item.quantity > 0;
      });
      console.log('Valid cart items:', validItems);
      setCartItems(validItems);
    } catch (error) {
      console.error('Failed to parse cart cookie:', error);
      setCartItems([]);
      Cookies.remove('cart');
    }
  }, [slug, products]);

  // Save cart to cookies
  useEffect(() => {
    if (!Cookies) {
      console.error('js-cookie is not available');
      return;
    }
    if (cartItems.length === 0) {
      console.log('Cart is empty, removing cookie');
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
    try {
      console.log('Saving cart to cookie:', cartData);
      Cookies.set('cart', JSON.stringify(cartData), {
        expires: 7,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
      });
      console.log('Cart saved to cookie successfully');
    } catch (error) {
      console.error('Failed to save cart to cookie:', error);
    }
  }, [cartItems, slug]);

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
  };

  const addToCart = (product: Product) => {
    if (!product._id || !product.name || typeof product.price !== 'number' || !product.isAvailable) {
      console.error(`Invalid product data for ${product.name || 'unknown'}:`, product);
      return;
    }
    console.log(`Adding product to cart: ${product.name}, ID: ${product._id}, Available: ${product.isAvailable}, Stock: ${product.stockCount || 'N/A'}`);
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (product.stockCount && newQuantity > product.stockCount) {
          console.log(`Cannot add ${product.name}: exceeds stock count (${product.stockCount})`);
          return prev;
        }
        console.log(`Incrementing quantity for ${product.name} to ${newQuantity}`);
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQuantity } : item
        );
      }
      const newItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || '/fallback-image.jpg',
        quantity: 1,
      };
      console.log(`Adding new item to cart:`, newItem);
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find((p) => p._id === id);
    if (product && product.stockCount && quantity > product.stockCount) {
      console.log(`Cannot update quantity for ${product.name}: exceeds stock count (${product.stockCount})`);
      return;
    }
    console.log(`Updating quantity for item ${id} to ${quantity}, Stock: ${product?.stockCount || 'N/A'}`);
    if (quantity <= 0) {
      console.log(`Removing item ${id} from cart`);
      setCartItems((prev) => prev.filter((item) => item._id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, quantity } : item))
      );
    }
  };

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logo && (
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
                />
              )}
              <h1
                className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900"
                style={{ color: secondaryColor }}
              >
                {name}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden sm:block flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100/50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition-all duration-300 placeholder-gray-400"
                  aria-label="Search products"
                />
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100/50 rounded-full transition-all duration-200"
                style={{ color: secondaryColor }}
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  if (isMobileMenuOpen) setSearchQuery('');
                }}
                className="sm:hidden p-2 hover:bg-gray-100/50 rounded-full transition-all duration-200"
                style={{ color: secondaryColor }}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
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
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50`}>
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-4/5 sm:w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Cart ({getTotalItems()})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ color: secondaryColor }}
                aria-label="Close cart"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-xs sm:text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-xs sm:text-sm text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-xs">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            style={{ color: secondaryColor }}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <span className="font-medium text-gray-900 text-xs sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            style={{ color: secondaryColor }}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t p-4 sm:p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    Total: {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <button
                  className="w-full py-2.5 sm:py-3 rounded-lg font-semibold text-white transition-all hover:scale-[0.98] text-xs sm:text-sm"
                  style={{ backgroundColor: secondaryColor }}
                  aria-label="Proceed to checkout"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: secondaryColor }}>
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/600')] bg-cover bg-center opacity-5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {name}
            </span>
          </h1>
          {description && (
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-4 sm:mb-6 max-w-xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          <button
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold text-white transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto text-sm sm:text-base"
            style={{ backgroundColor: secondaryColor }}
            aria-label="Explore products"
          >
            Explore Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
            {searchQuery ? `"${searchQuery}"` : 'Featured Products'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {searchQuery ? `${filteredProducts.length} results found` : 'Discover our curated collection'}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">No products available</p>
            {searchQuery && (
              <p className="text-sm mt-2">Try adjusting your search to find what you're looking for.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/${product._id}`}
                className="group bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.images ? (
                     <img
                    src={product.images[0] || '/fallback-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  ): ('')}

             

                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex gap-1">
                    <button
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      style={{ color: secondaryColor }}
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation when clicking "Add to Cart"
                      addToCart(product);
                    }}
                    disabled={!product.isAvailable}
                    className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 py-2 text-white font-medium rounded-lg transition-all transform opacity-0 group-hover:opacity-100 disabled:opacity-50 text-sm"
                    style={{ backgroundColor: secondaryColor }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-2 text-gray-900 leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-bold text-base sm:text-lg text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.discountPrice)}
                        </span>
                      )}
                    </div>
                    
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Stay in the Loop</h2>
          <p className="text-gray-200 mb-4 sm:mb-6 text-sm sm:text-base">
            Get updates on new products and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2 sm:gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-full bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400 text-sm sm:text-base"
              aria-label="Email for newsletter"
            />
            <button
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium text-white transition-all hover:scale-105 text-sm sm:text-base whitespace-nowrap"
              style={{ backgroundColor: secondaryColor }}
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center sm:text-left sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {logo && <img src={logo} alt={`${name} logo`} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full" />}
              <span className="font-semibold text-sm sm:text-base">{name}</span>
            </div>

            <div className="text-center text-gray-400 text-xs sm:text-sm order-3 sm:order-2">
              <p>contact@{slug}.com</p>
              <p>+1 (555) 123-4567</p>
            </div>

            <div className="flex flex-col items-center gap-2 text-xs sm:text-sm text-gray-500 order-2 sm:order-3">
              <span>© 2025 {name}. All rights reserved.</span>
              <a
                href="https://spak.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <span>Powered by</span>
                <span className="font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all">
                  Spak
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernStoreTemplate;