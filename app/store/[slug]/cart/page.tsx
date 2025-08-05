'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, X, Plus, Minus, Loader2, Instagram, Facebook, Twitter } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Store } from '@/store/useAppStore';
import Header from '@/components/template/modernStore/header';

const CartView: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, addItem, removeItem, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get('store');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (!storeSlug) {
      setError('No store specified');
      setIsLoading(false);
      return;
    }

    const fetchStore = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${storeSlug}`);
        if (!response.ok) {
          throw new Error('Store not found');
        }
        const data = await response.json();

        const storeResponse = data.data;

        const storeData: Store = {
          _id: storeResponse._id,
          name: storeResponse.name || 'Unknown Store',
          slug: storeResponse.slug || storeSlug,
          description: storeResponse.description,
          logo: storeResponse.logo || '/api/placeholder/100/100',
          primaryColor: storeResponse.primaryColor || '#ffffff',
          secondaryColor: storeResponse.secondaryColor || '#000000',
          currency: storeResponse.currency || 'USD',
          domain: storeResponse.domain,
          socialLinks: storeResponse.socialLinks || {},
          contact: storeResponse.contact || {},
          shipping: storeResponse.shipping || { enabled: false, locations: [] },
          pickup: storeResponse.pickup || { enabled: false },
          policies: storeResponse.policies || {},
          isPublished: storeResponse.isPublished ?? false,
          products: storeResponse.products || [],
          createdAt: storeResponse.createdAt || new Date().toISOString(),
          template: storeResponse.template,
          font: storeResponse.font,
        };

        if (storeData.isPublished === false) {
          throw new Error('Store is not published');
        }

        setStore(storeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching store data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [storeSlug]);

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: store?.currency || 'USD',
      }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
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

  const handleQuantityChange = (item: { id: string; title: string; price: number; quantity: number; storeId: string}, delta: number) => {
    const product = store?.products?.find((p) => p._id === item.id);
    if (!product) return;

    if (delta < 0 && item.quantity <= 1) {
      removeItem(item.id);
    } else if (delta > 0) {
      addItem({ ...item, quantity: 1 });
    } else if (delta < 0) {
      addItem({ ...item, quantity: -1 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCheckoutError(null);
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const { fullName, email, phoneNumber, address } = formData;
      if (!fullName || !email || !phoneNumber || !address) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: store?._id,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            name: item.title,
            price: item.price,
          })),
          
            fullName,
            email,
            phone: phoneNumber,
            address,
          
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed. Please try again.');
      }

      const data = await response.json();
      const paystackUrl = data.checkoutUrl; // Assuming the Paystack URL is in data.data.paymentUrl
      if (paystackUrl) {
        window.location.href = paystackUrl; // Redirect to Paystack URL
      } else {
        throw new Error('No payment URL received from the server');
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600 text-sm">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">{error || 'Store not found.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        store={store}
        setIsCartOpen={() => {}}
        setSearchQuery={setSearchQuery}
        searchQuery={searchQuery}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
            Your Cart ({getTotalItems()})
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {getTotalItems() === 0 ? 'Your cart is empty' : 'Review your selected items'}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-base sm:text-lg font-medium">No items in your cart</p>
            <Link
              href={`/${store.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-full text-white font-semibold transition-all hover:scale-105"
              style={{ backgroundColor: store.secondaryColor }}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex-1">
                      <Link
                        href={`/${store.slug}/product/${item.id}`}
                        className="font-medium text-sm sm:text-base text-gray-900 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          style={{ color: store.secondaryColor }}
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <span className="font-medium text-gray-900 text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          style={{ color: store.secondaryColor }}
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ color: store.secondaryColor }}
                          className="ml-4"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm sm:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm sm:text-base text-gray-600">Subtotal ({getTotalItems()} items)</span>
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Checkout</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full text-black p-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md text-black p-3 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md p-3 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="+234 "
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md p-3 text-black border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="123 Main St, City, Country"
                    rows={4}
                    required
                  />
                </div>
                {checkoutError && (
                  <p className="text-sm text-red-600">{checkoutError}</p>
                )}
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:scale-[0.98] text-sm sm:text-base"
                  style={{ backgroundColor: store.secondaryColor }}
                  disabled={isCheckoutLoading || items.length === 0}
                >
                  {isCheckoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
                <button
                  onClick={() => clearCart()}
                  className="w-full py-3 mt-3 rounded-lg font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-sm sm:text-base"
                  aria-label="Clear cart"
                >
                  Clear Cart
                </button>
                <Link
                  href={`/`}
                  className="block text-center mt-3 text-sm text-gray-600 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="text-white py-12" style={{ backgroundColor: store.secondaryColor }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                {store.logo && (
                  <div className="relative w-8 h-8">
                    <img
                      src={store.logo}
                      alt="Logo"
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

export default CartView;