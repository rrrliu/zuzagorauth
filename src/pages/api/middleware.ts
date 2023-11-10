import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { host }: any = req.headers;

  // Check if the request is from the root domain
  if (host === 'zuzagora.com') {
    // Perform the redirect
    return NextResponse.redirect('https://www.zuzagora.com/');
  }

  // If it's not the root domain, no redirect is performed
  return NextResponse.next();
}