import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;
const MAIN_DOMAINS = ['zeevo.shop', 'www.zeevo.shop', 'localhost:3001', '127.0.0.1:3001', '172.20.10.14:3001'];

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const pathname = req.nextUrl.pathname;

  // Skip if main domains
  if (MAIN_DOMAINS.includes(hostname)) {
    return NextResponse.next();
  }

  // Skip special cases
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/store') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const subdomain = hostname.split('.')[0];
  const url = req.nextUrl.clone();

  // 👉 Preserve the pathname!
  url.pathname = `/store/${subdomain}${pathname}`;
  console.log(url)
  return NextResponse.rewrite(url);
}
