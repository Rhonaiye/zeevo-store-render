import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

type Store = {
  slug: string;
  products: Array<{ _id: string }>;
  updatedAt?: string;
};

async function getCurrentDomain() {
  const headersList = await headers();
  const domain = headersList.get('host') || 'zeevo.shop';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${domain}`;
}

function formatDate(date: string | undefined) {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export async function GET() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) {
      throw new Error('API base URL not configured');
    }

    const headersList = await headers();
    const host = headersList.get('host') || '';

    // Fetch sitemap from backend API
    const response = await fetch(`${apiBase}/v1/store/sitemap.xml`, {
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status}`);
    }

    const sitemap = await response.text();

    // Return the sitemap with proper headers
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return a basic sitemap with just the homepage in case of errors
    const domain = await getCurrentDomain();
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}