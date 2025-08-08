'use client';
import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, ArrowLeft } from 'lucide-react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Store {
  _id: string;
}

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  formatPrice: (price: number) => string;
  primaryColor?: string;
  secondaryColor?: string;
  isPreview?: boolean;
  store?: Store;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isCartOpen,
  setIsCartOpen,
  cartItems,
  updateQuantity,
  getTotalItems,
  getTotalPrice,
  formatPrice,
  primaryColor = '#ffffff',
  secondaryColor = '#d97706',
  isPreview = false,
  store,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    phoneNumber: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const { fullName, email, phoneNumber, address } = formData;
      if (!fullName || !email || !phoneNumber || !address) {
        throw new Error('Please fill in all required fields');
      }
      if (!store?._id) {
        throw new Error('Store ID is missing');
      }
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      cartItems.forEach(item => {
        if (!item._id || item.quantity <= 0 || item.price < 0) {
          throw new Error(`Invalid item data: ${item.name}`);
        }
      });
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const payload = {
        storeId: store._id,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        fullName,
        email,
        phone: phoneNumber,
        address,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Checkout failed. Please try again.');
      }

      const data = await response.json();
      const paystackUrl = data.checkoutUrl;
      if (paystackUrl) {
        window.location.href = paystackUrl;
      } else {
        throw new Error('No payment URL received from the server');
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleBackToCart = () => {
    setShowCheckout(false);
    setCheckoutError(null);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckout();
  };

  const isFormValid = formData.fullName && formData.address && formData.email && formData.phoneNumber;

  if (!isCartOpen) return null;

  return (
    <div className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex justify-end`}>
      <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)} />
      <div 
        className="w-full sm:w-80 shadow-xl transform transition-transform duration-300 translate-x-0 flex flex-col h-full"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="p-6 border-b" style={{ borderColor: `${secondaryColor}33` }}>
          <div className="flex justify-between items-center">
            {showCheckout ? (
              <>
                <button 
                  onClick={handleBackToCart}
                  className="flex items-center gap-2"
                  aria-label="Back to cart"
                >
                  <ArrowLeft size={20} style={{ color: secondaryColor }} />
                  <span style={{ color: secondaryColor }}>Back</span>
                </button>
                <h2 
                  className="text-lg font-bold"
                  style={{ color: secondaryColor }}
                >
                  Checkout
                </h2>
              </>
            ) : (
              <>
                <h2 
                  className="text-lg font-bold"
                  style={{ color: secondaryColor }}
                >
                  Cart ({getTotalItems()})
                </h2>
              </>
            )}
            <button onClick={() => setIsCartOpen(false)} aria-label="Close cart">
              <X size={24} style={{ color: secondaryColor }} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {!showCheckout ? (
            // Cart View
            <>
              {cartItems.length === 0 ? (
                <div className="text-center mt-12">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" style={{ color: secondaryColor }} />
                  <p style={{ color: secondaryColor, opacity: 0.7 }}>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 
                          className="font-medium"
                          style={{ color: secondaryColor }}
                        >
                          {item.name}
                        </h3>
                        <p style={{ color: secondaryColor, opacity: 0.8 }}>
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={20} style={{ color: secondaryColor }} />
                          </button>
                          <span style={{ color: secondaryColor }}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={20} style={{ color: secondaryColor }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Checkout Form View
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {checkoutError && (
                <div 
                  className="p-3 rounded-lg text-sm"
                  style={{ backgroundColor: `${secondaryColor}22`, color: secondaryColor }}
                >
                  {checkoutError}
                </div>
              )}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: secondaryColor }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: `${secondaryColor}33`,
                    color: secondaryColor
                  }}
                  required
                  placeholder="Enter your full name"
                  disabled={isCheckoutLoading}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: secondaryColor }}
                >
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    borderColor: `${secondaryColor}33`,
                    color: secondaryColor
                  }}
                  rows={3}
                  required
                  placeholder="Enter your complete address"
                  disabled={isCheckoutLoading}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: secondaryColor }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: `${secondaryColor}33`,
                    color: secondaryColor
                  }}
                  required
                  placeholder="Enter your email address"
                  disabled={isCheckoutLoading}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: secondaryColor }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: `${secondaryColor}33`,
                    color: secondaryColor
                  }}
                  required
                  placeholder="Enter your phone number"
                  disabled={isCheckoutLoading}
                />
              </div>
              
              <div className="pt-4 border-t" style={{ borderColor: `${secondaryColor}33` }}>
                <h3 className="font-medium mb-2" style={{ color: secondaryColor }}>Order Summary</h3>
                <div className="space-y-1 mb-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span style={{ color: secondaryColor, opacity: 0.8 }}>
                        {item.name} x {item.quantity}
                      </span>
                      <span style={{ color: secondaryColor, opacity: 0.8 }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span style={{ color: secondaryColor }}>Total:</span>
                  <span style={{ color: secondaryColor }}>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </form>
          )}
        </div>
        
        {/* Footer with action buttons */}
        <div className="p-6 border-t" style={{ borderColor: `${secondaryColor}33` }}>
          {!showCheckout ? (
            cartItems.length > 0 && (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: secondaryColor }}
                aria-label="Proceed to checkout"
                disabled={isCheckoutLoading}
              >
                Checkout
              </button>
            )
          ) : (
            <button
              onClick={handleSubmitOrder}
              disabled={!isFormValid || isCheckoutLoading}
              className={`w-full py-3 text-white rounded-lg transition-opacity ${
                isFormValid && !isCheckoutLoading ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
              }`}
              style={{ backgroundColor: secondaryColor }}
              aria-label="Complete order"
            >
              {isCheckoutLoading ? 'Processing...' : 'Complete Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;