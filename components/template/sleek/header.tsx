"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/store/useAppStore';

interface HeaderProps {
  name: string;
  logo?: string;
  storeSlug: string;
  primaryColor?: string;
  secondaryColor?: string;
  getTotalItems: () => number;
  setIsCartOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  name,
  logo,
  secondaryColor = '#d97706',
  storeSlug,
  setIsCartOpen,
  primaryColor = '#ffffff',
}) => {
  const { getTotalItems } = useCartStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [storeProducts, setStoreProducts] = useState<Product[] | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const submitSearch = (q?: string) => {
    const val = (q ?? query).trim();
    if (!val) return;
    // Navigate to store search results (query param `q`)
    router.push(`/store/${storeSlug}?q=${encodeURIComponent(val)}`);
  };

  // Fetch store products once when mobile search opens (lazy)
  useEffect(() => {
    if (!isMobileSearchOpen || storeProducts) return;
    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) return;

    (async () => {
      try {
        const res = await fetch(`${apiBase}/v1/store/by/${storeSlug}`);
        if (!res.ok) return;
        const data = await res.json();
        const storeData = data?.data || data;
        if (cancelled) return;
        const products = Array.isArray(storeData?.products) ? storeData.products : [];
        setStoreProducts(products as Product[]);
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [isMobileSearchOpen, storeProducts, storeSlug]);

  return (
    <header
      className="sticky top-0 left-0 right-0 z-40 border-b border-white/10 shadow-sm backdrop-blur-md"
      style={{
        backgroundColor: primaryColor || '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          {logo && (
            <div className="relative">
              <img
                src={logo}
                alt={`${name} logo`}
                className="w-12 h-12 rounded-full object-cover border border-white/20"
              />
            </div>
          )}
        </div>

        {/* Center: Store Name */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          <h1
            className="text-xl font-bold"
            style={{ color: secondaryColor }}
          >
            {name}
          </h1>

          {/* Desktop: no search here; mobile search toggled by icon */}
        </div>

        {/* Mobile search icon (moved next to cart to avoid center overlap) */}
        {/* Right: Cart & mobile search */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Open search"
            className="p-2 rounded-md sm:hidden"
            title="Search"
            style={{ color: secondaryColor }}
          >
            <Search size={20} />
          </button>

          <Link href={`/cart?store=${storeSlug}`}>
          <button
            className="relative p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: secondaryColor,
            }}
            aria-label="Open cart"
          >
            <ShoppingBag size={24} strokeWidth={1.5} />
            {getTotalItems() > 0 && (
              <span
                style={{ backgroundColor: secondaryColor }}
                className="absolute top-0.5 left-5 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium"
              >
                {getTotalItems()}
              </span>
            )}
          </button>
        </Link>
        </div>
      </div>

      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="absolute left-0 right-0 top-full bg-white z-50 shadow-md p-3 sm:hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  // debounce opening suggestions
                  if (debounceRef.current) window.clearTimeout(debounceRef.current);
                  debounceRef.current = window.setTimeout(() => {
                    setSuggestionsOpen(!!v.trim());
                  }, 150);
                }}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none"
                aria-label="Search products"
                autoFocus
              />

              {/* Suggestions dropdown */}
              {suggestionsOpen && storeProducts && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                  {storeProducts
                    .filter((p) => p.name && p.name.toLowerCase().includes(query.toLowerCase()))
                    .slice(0, 6)
                    .map((p) => (
                      <Link
                        key={p._id}
                        href={`/store/${storeSlug}/${p._id}`}
                        onClick={() => { setIsMobileSearchOpen(false); setSuggestionsOpen(false); }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                      >
                        {p.images && p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{p.name}</div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
            <button
              onClick={() => { submitSearch(); setIsMobileSearchOpen(false); }}
              className="px-3 py-2 text-white rounded-md text-sm"
              style={{ backgroundColor: secondaryColor }}
            >
              Search
            </button>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Close search"
              className="p-2 rounded-md"
            >
              <X size={20} color={secondaryColor} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
