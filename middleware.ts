import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const MAIN_DOMAINS = [
  'zeevo.shop',
  'www.zeevo.shop',
  'localhost',
  'localhost:3000',
  'localhost:3001',
  '127.0.0.1',
  '127.0.0.1:3000',
  '127.0.0.1:3001',
  '172.20.10.14:3001',
  '172.20.10.14:3000',
  '::1',
];

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const pathname = req.nextUrl.pathname;

  // Skip special cases
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/store') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Allow main domains
  if (MAIN_DOMAINS.includes(hostname)) {
    return NextResponse.next();
  }

  // ✅ Handle nip.io subdomains
  if (hostname.includes('.nip.io')) {
    const subdomain = hostname.split('.')[0]; // zappercollections
    const url = req.nextUrl.clone();
    url.pathname = `/store/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ✅ Handle real subdomains (live)
  const subdomain = hostname.split('.')[0];
  const url = req.nextUrl.clone();
  url.pathname = `/store/${subdomain}${pathname}`;
  return NextResponse.rewrite(url);
}
