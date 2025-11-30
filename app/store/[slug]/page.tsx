
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import SleekStoreTemplate from '@/components/template/sleek';
import ModernStoreTemplate from '@/components/template/modernStore';

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
              }}
            />
          ))}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{slug}</h2>
        <p className="text-gray-500 text-sm">Loading store...</p>
      </div>
      <style jsx>{`
        @keyframes scale {
          0%, 40%, 100% { transform: scaleY(0.4); }
          20% { transform: scaleY(1); }
        }
        .animate-pulse { animation: scale 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

// Private Store Message Component
const PrivateStoreMessage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Image */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/store-404.png"
            alt="Private store"
            width={256}
            height={256}
            priority
            className="object-contain"
          />
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600">
          This store is currently set to private.
        </p>
      </div>
    </div>
  );
};

// Not Found Component - Unified for both store and page not found
const NotFound = ({ message }: { message: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Image */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/store-404.png"
            alt="Not found"
            width={256}
            height={256}
            priority
            className="object-contain"
          />
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600">
          {message}
        </p>
      </div>
    </div>
  );
};

import ZeevoPageRenderer from '@/components/renderer/ZeevoPageRenderer';

export default function StorePage() {
  const { slug } = useParams();
  const [store, setStore] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageNotFound, setPageNotFound] = useState(false);

  // Register view once store loads
  useEffect(() => {
    const registerView = async (storeId: string) => {
      // Cookie key for tracking if user has visited this specific store
      const viewCookieKey = `store_${storeId}_viewed`;
      const uniqueCookieKey = `store_${storeId}_unique`;

      // Check if this is a unique visitor (first time ever)
      const isUniqueVisitor = !Cookies.get(uniqueCookieKey);

      // Check if we should register a view (not viewed in last 30 minutes)
      const shouldRegisterView = !Cookies.get(viewCookieKey);

      // Only proceed if we should register a view
      if (!shouldRegisterView) return;

      const getDeviceType = () => {
        const ua = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone/i.test(ua)) return 'mobile';
        if (/tablet|ipad/i.test(ua)) return 'tablet';
        return 'desktop';
      };

      const getRegion = async () => {
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          return data.country_name || 'Unknown';
        } catch {
          return 'Unknown';
        }
      };

      const getTrafficSource = () => {
        const referrer = document.referrer;
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        if (utmSource) return utmSource;
        if (referrer) {
          if (referrer.includes('google.com')) return 'google';
          if (referrer.includes('facebook.com')) return 'facebook';
          if (referrer.includes('twitter.com')) return 'twitter';
          if (referrer.includes('instagram.com')) return 'instagram';
          if (referrer.includes('linkedin.com')) return 'linkedin';
          return 'referrer';
        }
        return 'direct';
      };

      try {
        const device = getDeviceType();
        const region = await getRegion();
        const trafficSource = getTrafficSource();

        // Send analytics with unique visitor flag
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/analytics/page-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId,
            device,
            region,
            trafficSource,
            isUniqueVisitor // Send this flag to backend
          }),
        });

        // Set view cookie (expires in 30 minutes)
        Cookies.set(viewCookieKey, '1', { expires: 0.0208 }); // 30 minutes

        // Set unique visitor cookie (expires in 365 days) - only if first time
        if (isUniqueVisitor) {
          Cookies.set(uniqueCookieKey, '1', { expires: 365 });
        }
      } catch (err) {
        console.error('Failed to register view:', err);
      }
    };

    if (store?._id && store?.isPublished) {
      registerView(store._id);
    }
  }, [store]);

  // Fetch store data
  useEffect(() => {
    if (!slug) return;

    const fetchStore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/store/by/${slug}`);
        const data = await res.json();

        if (res.ok) {
          const storeData = data.data;
          setStore(storeData);

          // If custom template, fetch page data
          if (storeData.template) {
            try {
              // Fetch the page data associated with this store
              const pageRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/page/${slug}`);
              const pageResult = await pageRes.json();
              console.log('Fetched page result:', pageResult);

              if (pageRes.ok) {
                const fetchedPageData = pageResult.data || pageResult;
                // Check if page is published
                if (fetchedPageData && fetchedPageData.isPublished !== false) {
                  console.log('Setting page data:', fetchedPageData);
                  setPageData(fetchedPageData);
                } else {
                  console.warn('Page exists but is not published');
                  setPageNotFound(true);
                }
              } else {
                console.error('Failed to fetch page data');
                setPageNotFound(true);
              }
            } catch (pageErr) {
              console.error('Error fetching page data:', pageErr);
              setPageNotFound(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching store:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [slug]);

  // Update metadata
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMetaTag = (name: string, content: string, attributeName: string = 'name') => {
      let meta = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

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
      updateMetaTag('description', `The store ${slug} could not be found.`);
      updateMetaTag('robots', 'noindex, nofollow');
      return;
    }

    if (!store.isPublished) {
      document.title = `Private Store - ${slug}`;
      updateMetaTag('description', `The store ${slug} is currently private.`);
      updateMetaTag('robots', 'noindex, nofollow');
      return;
    }

    document.title = `${store.name || slug} - Online Store`;
    updateMetaTag('description', store.description || `Shop at ${store.name || slug}.`);
    updateMetaTag('keywords', `${store.name}, online store, ${store.category || 'retail'}, ${slug}`);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', storeUrl, 'property');
    updateMetaTag('og:title', `${store.name || slug} - Online Store`, 'property');
    updateMetaTag('og:description', store.description || `Shop at ${store.name || slug}`, 'property');
    updateMetaTag('og:site_name', store.name || slug, 'property');
    if (store.logo) {
      updateMetaTag('og:image', store.logo, 'property');
      updateMetaTag('og:image:alt', `${store.name} logo`, 'property');
      updateLinkTag('icon', store.logo);
    }
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', storeUrl);
    updateMetaTag('twitter:title', `${store.name || slug} - Online Store`);
    updateMetaTag('twitter:description', store.description || `Shop at ${store.name || slug}`);
    if (store.logo) updateMetaTag('twitter:image', store.logo);
    if (store.primaryColor) updateMetaTag('theme-color', store.primaryColor);
    updateLinkTag('canonical', storeUrl);
  }, [loading, store, slug]);

  // Add structured data
  useEffect(() => {
    if (!store || !store.isPublished || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'store-structured-data';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      name: store.name || slug,
      description: store.description,
      url: `${window.location.origin}/store/${slug}`,
      ...(store.logo && { logo: store.logo }),
      ...(store.location && { address: store.location }),
      ...(store.phone && { telephone: store.phone }),
      ...(store.email && { email: store.email }),
      currenciesAccepted: store.currency || 'USD',
      paymentAccepted: 'Credit Card, PayPal, Bank Transfer',
    });

    document.head.appendChild(script);
    return () => {
      const scriptToRemove = document.getElementById('store-structured-data');
      if (scriptToRemove) document.head.removeChild(scriptToRemove);
    };
  }, [store, slug]);

  // Add custom font
  useEffect(() => {
    if (!store?.font || store.font === 'Arial, sans-serif' || typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${store.font.replace(' ', '+')}&display=swap`;
    link.id = 'store-custom-font';
    document.head.appendChild(link);

    return () => {
      const linkToRemove = document.getElementById('store-custom-font');
      if (linkToRemove) document.head.removeChild(linkToRemove);
    };
  }, [store?.font]);

  if (loading) return <ScaleLoader slug={slug as string} color={store?.secondaryColor} />;
  if (!store) return <NotFound message="The store you're looking for could not be found." />;
  if (!store.isPublished) return <PrivateStoreMessage />;

  if (store.template === 'custom') {
    // Show page not found if we've determined the page doesn't exist or isn't published
    if (pageNotFound) {
      return <NotFound message="This store doesn't exist or hasn't been published yet." />;
    }
    // Still loading page data
    if (!pageData) {
      return <ScaleLoader slug={slug as string} color={store?.secondaryColor} />;
    }
    return <ZeevoPageRenderer page={pageData} storeId={store._id} store={store} />;
  }

  return (
    <div style={{ fontFamily: store?.font || 'Arial, sans-serif' }}>
      {store.template === 'modern' ? <ModernStoreTemplate store={store} /> : <SleekStoreTemplate store={store} />}
    </div>
  );
}