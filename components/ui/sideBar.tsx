'use client';
import React, { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Store, Settings, LogOut, Package, BarChart3, User, ChevronDown, X } from 'lucide-react';
import { UserProfile, NavItem } from '@/store/useAppStore';
import Image from 'next/image';

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  userProfile: UserProfile | null;
  handleLogout: () => void;
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  activeSection,
  setActiveSection,
  userProfile,
  handleLogout,
  navItems,
}) => {
  const sidebarRef = useRef<HTMLElement>(null);

  // Load saved section on mount
  useEffect(() => {
    const savedSection = getCookie('lastActiveSection');
    if (savedSection && navItems.some(item => item.id === savedSection)) {
      setActiveSection(savedSection);
    }
  }, [setActiveSection, navItems]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, toggleSidebar]);

  const handleNavClick = useCallback((itemId: string) => {
    setActiveSection(itemId);
    setCookie('lastActiveSection', itemId, 30); // Save for 30 days
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  }, [setActiveSection, toggleSidebar]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
          
          <motion.aside
            ref={sidebarRef}
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl border-r border-gray-200 z-50"
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <header className=" px-4 pb-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <Image width={80} height={80} src={'/zeevo.png'} alt='Zeevo logo' className='w-[10vh]'/>
                  <p className="text-sm font-medium text-gray-600">Your store builder</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSidebar}
                  className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </header>
              
              {/* Navigation */}
              <nav className="flex-1 p-4" role="navigation">
                <ul className="space-y-1" role="list">
                  {navItems.map((item) => (
                    <li key={item.id} role="listitem">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                          activeSection === item.id
                            ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600 shadow-sm'
                            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                        aria-current={activeSection === item.id ? 'page' : undefined}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Store Counter */}
              {(userProfile?.stores?.length || 0) > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Your Store
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {userProfile?.stores?.length || 0}/1 store
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logout */}
              <footer className="p-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </footer>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;