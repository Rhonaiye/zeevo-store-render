'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag, Star, Heart, Search, Menu, X, Plus, Minus } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { Product } from '@/store/useAppStore';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}


interface Store {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currency?: string;
  products?: Product[];
  contact?: {email: string, phone: string, address: string}
}

interface SleekStoreTemplateProps {
  store: Store;
  isPreview?: boolean;
}

const SleekStoreTemplate: React.FC<SleekStoreTemplateProps> = ({ store, isPreview = false }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    name,
    slug = name.toLowerCase().replace(/\s+/g, '-'),
    description,
    logo,
    primaryColor = '#059669',
    secondaryColor = '#d97706',
    currency = 'USD',
    products = [],
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

  const formatPrice = (price: number): string => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
  };

  const addToCart = (product: Product): void => {
    if (!product._id || !product.name || typeof product.price !== 'number' || !product.isAvailable) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (product.stockCount && newQuantity > product.stockCount) return prev;
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.price,
        // @ts-ignore
        image: product.images[0]|| '/fallback-image.jpg',
        quantity: 1,
      }];
    });
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
    () => products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [products, searchQuery]
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header - Fixed within this page only */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && <img src={logo} alt={`${name} logo`} className="w-8 h-8 rounded-full" />}
            <h1 className="text-xl font-bold text-gray-800">{name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-[#d97706]"
              aria-label="Open cart"
            >
              <ShoppingBag size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50">
          <div className="bg-white w-3/4 h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">{name}</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <a href="#products" className="text-gray-600 hover:text-[#d97706]" onClick={() => setIsMobileMenuOpen(false)}>
                Shop Now
              </a>
              <a href="#newsletter" className="text-gray-600 hover:text-[#d97706]" onClick={() => setIsMobileMenuOpen(false)}>
                Newsletter
              </a>
              <a href="#footer" className="text-gray-600 hover:text-[#d97706]" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex justify-end`}>
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)} />
          <div className="w-80 bg-white shadow-xl transform transition-transform duration-300 translate-x-0">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Cart ({getTotalItems()})</h2>
                <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`}>
                            <Minus size={20} className="text-gray-600" />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`}>
                            <Plus size={20} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="text-gray-800">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <button
                    className="w-full py-3 text-white rounded-lg hover:bg-[#c56a05]"
                    style={{ backgroundColor: secondaryColor }}
                    aria-label="Proceed to checkout"
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-24 pb-12" style={{ backgroundColor: secondaryColor }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{name}</h1>
          {description && <p className="text-lg text-gray-100 mb-6 max-w-2xl mx-auto">{description}</p>}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {searchQuery ? `Results for "${searchQuery}"` : 'Featured Products'}
          </h2>
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              style={{color: secondaryColor}}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706]"
              aria-label="Search products"
            />
          </div>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No products found</p>
            {searchQuery && <p className="text-sm mt-2">Try a different search term.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/${product._id}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative aspect-square">
                   {product.images && (
                    <Image
                    width={100}
                    height={100}
                    quality={70}
                    src={product.images[0] || '/fallback-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                   )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                      aria-label={`Add ${product.name} to wishlist`}
                    >
                      <Heart size={14} />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation when clicking "Add to Cart"
                      addToCart(product);
                    }}
                    disabled={!product.isAvailable}
                    className="absolute inset-x-2 bottom-2 py-1.5 text-white text-sm rounded-md hover:bg-[#c56a05] disabled:opacity-50 transition-opacity opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: secondaryColor }}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-base text-gray-800 line-clamp-2">{product.name}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${product.discountPrice ? `line-through text-[0.69em] font-extralight text-gray-400`: ''}`} >{formatPrice(product.price)}</span>
                    </div>
                    {product.discountPrice && (
                      <span className={`text-sm font-bold my-0`} style={{color: store.secondaryColor}}>
                        {formatPrice(product.discountPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="bg-zinc-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Stay in the Loop</h2>
          <p className="text-gray-600 mb-6">Get the latest updates on new products and exclusive offers.</p>
          <div className="flex max-w-md mx-auto gap-3">
            <input
              style={{color: secondaryColor}}
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d97706]"
              aria-label="Email for newsletter"
            />
            <button
              className="px-6 py-2 text-white rounded-lg hover:bg-[#c56a05]"
              style={{ backgroundColor: secondaryColor }}
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="text-white py-8" style={{ backgroundColor: secondaryColor }}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            {logo && <img src={logo} alt={`${name} logo`} className="w-8 h-8 rounded-full mb-2" />}
            <span className="font-bold text-lg">{name}</span>
            <p className="text-gray-100 text-sm mt-2">Your one-stop shop for quality products.</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Contact</h3>
            <p className="text-gray-100">{store?.contact?.email}</p>
            <p className="text-gray-100">{store?.contact?.phone}</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Follow Us</h3>
            <div className="flex justify-center gap-4">
              <a href="#" className="text-gray-100 hover:text-white">Twitter</a>
              <a href="#" className="text-gray-100 hover:text-white">Instagram</a>
              <a href="#" className="text-gray-100 hover:text-white">Facebook</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-100 text-sm">
          <p>© 2025 {name}. All rights reserved.</p>
          <a
            href="https://spak.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white mt-5"
          >
            Powered by Spak
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SleekStoreTemplate;