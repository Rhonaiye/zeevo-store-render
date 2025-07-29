'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import { Store } from '@/store/useAppStore';
import StoreTemplate from '@/components/template/page';
import Cookies from 'js-cookie';
import SleekStoreTemplate from '@/components/template/template2';
import ModernStoreTemplate from '@/components/template/page';

// Scale Loader Component
const ScaleLoader = ({ slug, color = 'black' }: { slug: string; color?: string }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                transform: 'scaleY(0.4)',
              }}
            />
          ))}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{slug}</h2>
        <p className="text-gray-500 text-sm">Loading store...</p>
      </div>
      
      <style jsx>{`
        @keyframes scale {
          0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
        
        .animate-pulse {
          animation: scale 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Private Store Message Component
const PrivateStoreMessage = ({ slug }: { slug: string }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Store is Private</h1>
        <p className="text-gray-600 mb-2">
          The store <span className="font-semibold text-gray-900">"{slug}"</span> is currently set to private.
        </p>
        <p className="text-gray-500 text-sm">
          Please check back later or contact the store owner for access.
        </p>
        
        <div className="mt-8">
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

// Store Not Found Component
const StoreNotFound = ({ slug }: { slug: string }) => {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-6">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-red-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Store Not Found</h1>
        <p className="text-gray-600 mb-2 text-lg">
          We couldn't find a store with the name <span className="font-semibold text-red-600">"{slug}"</span>
        </p>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The store might have been removed, renamed, or the URL might be incorrect. 
          Please double-check the store name or contact support if you believe this is an error.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={goBack}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function StorePage() {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Set initial loading title immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Loading...';
      updateMetaTag('description', 'Loading store...');
      updateMetaTag('robots', 'noindex, nofollow');
    }
  }, []);

  // Register view once store loads
  useEffect(() => {
    const registerView = async (storeId: string) => {
      const cookieKey = `store_${storeId}_viewed`;

      // Already viewed today?
      if (Cookies.get(cookieKey)) return;

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/view/${slug}`, {
          method: 'PATCH',
        });

        // Set cookie to expire in 24h
        Cookies.set(cookieKey, '1', { expires: 1 });
      } catch (err) {
        console.error('Failed to register view:', err);
      }
    };

    if (store?._id && store?.isPublished) {
      registerView(store._id);
    }
  }, [store, slug]);

  useEffect(() => {
    if (!slug) return;

    const fetchStore = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`);
        const data = await res.json();

        if (res.ok) {
          setStore(data.data);
        } else {
          console.error('Failed to fetch store:', data.message);
        }
      } catch (err) {
        console.error('Error fetching store:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  // Set the font dynamically based on store.font
  const storeFont = store?.font || 'Arial, sans-serif';

  // Dynamic metadata updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update document title and meta tags dynamically
    const updateMetadata = () => {
      const baseUrl = window.location.origin;
      const storeUrl = `${baseUrl}/store/${slug}`;

      if (loading) {
        document.title = 'Loading...';
        updateMetaTag('description', 'Loading store...');
        updateMetaTag('robots', 'noindex, nofollow');
        return;
      }

      if (!store) {
        document.title = `Store Not Found - ${slug}`;
        updateMetaTag('description', `The store ${slug} could not be found. Please check the URL or contact support.`);
        updateMetaTag('robots', 'noindex, nofollow');
        return;
      }

      if (!store.isPublished) {
        document.title = `Private Store - ${slug}`;
        updateMetaTag('description', `The store ${slug} is currently private and not available for public viewing.`);
        updateMetaTag('robots', 'noindex, nofollow');
        return;
      }

      // Published store metadata
      document.title = `${store.name || slug} - Online Store`;
      updateMetaTag('description', store.description || `Shop at ${store.name || slug} - Browse our collection of products and services.`);
      updateMetaTag('keywords', `${store.name}, online store, shop, ${store.category || 'retail'}, ${slug}`);
      updateMetaTag('author', store.owner?.name || store.name);
      updateMetaTag('robots', 'index, follow');
      
      // Open Graph
      updateMetaTag('og:type', 'website', 'property');
      updateMetaTag('og:url', storeUrl, 'property');
      updateMetaTag('og:title', `${store.name || slug} - Online Store`, 'property');
      updateMetaTag('og:description', store.description || `Shop at ${store.name || slug}`, 'property');
      updateMetaTag('og:site_name', store.name || slug, 'property');
      if (store.logo) {
        updateMetaTag('og:image', store.logo, 'property');
        updateMetaTag('og:image:alt', `${store.name} logo`, 'property');
      }
      
      // Twitter
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:url', storeUrl);
      updateMetaTag('twitter:title', `${store.name || slug} - Online Store`);
      updateMetaTag('twitter:description', store.description || `Shop at ${store.name || slug}`);
      if (store.logo) {
        updateMetaTag('twitter:image', store.logo);
      }
      
      // Theme color
      if (store.primaryColor) {
        updateMetaTag('theme-color', store.primaryColor);
      }
      
      // Canonical URL
      updateLinkTag('canonical', storeUrl);
      
      // Favicon
      if (store.logo) {
        updateLinkTag('icon', store.logo, 'icon');
      }
    };

    updateMetadata();
  }, [loading, store, slug]);

  // Add structured data
  useEffect(() => {
    if (store && store.isPublished && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'store-structured-data';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Store",
        "name": store.name || slug,
        "description": store.description,
        "url": `${window.location.origin}/store/${slug}`,
        ...(store.logo && { "logo": store.logo }),
        ...(store.location && { "address": store.location }),
        ...(store.phone && { "telephone": store.phone }),
        ...(store.email && { "email": store.email }),
        "currenciesAccepted": store.currency || "USD",
        "paymentAccepted": "Credit Card, PayPal, Bank Transfer"
      });
      
      // Remove existing structured data
      const existing = document.getElementById('store-structured-data');
      if (existing) {
        document.head.removeChild(existing);
      }
      
      document.head.appendChild(script);
      
      return () => {
        const scriptToRemove = document.getElementById('store-structured-data');
        if (scriptToRemove) {
          document.head.removeChild(scriptToRemove);
        }
      };
    }
  }, [store, slug]);

  // Add custom font
  useEffect(() => {
    if (store?.font && store.font !== 'Arial, sans-serif' && typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${store.font.replace(' ', '+')}&display=swap`;
      link.id = 'store-custom-font';
      
      // Remove existing font
      const existing = document.getElementById('store-custom-font');
      if (existing) {
        document.head.removeChild(existing);
      }
      
      document.head.appendChild(link);
      
      return () => {
        const linkToRemove = document.getElementById('store-custom-font');
        if (linkToRemove) {
          document.head.removeChild(linkToRemove);
        }
      };
    }
  }, [store?.font]);

  if (loading) return <ScaleLoader slug={slug as string} color={store?.secondaryColor} />;
  if (!store) return <StoreNotFound slug={slug as string} />;
  
  // Check if store is published
  if (!store.isPublished) {
    return <PrivateStoreMessage slug={slug as string} />;
  }

  return (
    <div style={{ fontFamily: storeFont }}>
       {store?.template == 'modern' ?  <ModernStoreTemplate store={store}/>:  <SleekStoreTemplate store={store}/>}
    </div>
  );
}

// Helper functions to update meta tags
function updateMetaTag(name: string, content: string, attributeName: string = 'name') {
  if (typeof window === 'undefined') return;
  
  let meta = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attributeName, name);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

function updateLinkTag(rel: string, href: string, type?: string) {
  if (typeof window === 'undefined') return;
  
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  
  link.href = href;
  if (type) {
    link.type = type;
  }
}