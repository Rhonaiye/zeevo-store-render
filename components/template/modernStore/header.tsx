'use client';
import React from 'react';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Store } from '@/store/useAppStore';
import Link from 'next/link';

interface HeaderProps {
  store: Store;
  setIsCartOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

const Header: React.FC<HeaderProps> = ({
  store,
  setSearchQuery,
  searchQuery,
}) => {
  const { name, logo, secondaryColor = '#6366f1' } = store;
  const { getTotalItems } = useCartStore();

  return (
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

             <Link href={`/cart?store=${store.slug}`}>
                  <button className="relative p-2 hover:bg-gray-100/50 rounded-full transition-all duration-200" style={{ color: secondaryColor }} aria-label="Open cart">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                  {getTotalItems() > 0 && (
                     <span style={{backgroundColor: secondaryColor}} className={`absolute top-0.5 left-5  text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium`}>
                       {getTotalItems()}
                     </span>
                   )}
               </button>
             </Link>

        
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;