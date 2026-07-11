import { NextResponse, type NextRequest, type NextMiddleware } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const PROTECTED_PREFIXES = [
  '/home',
  '/new',
  '/rooms',
  '/voiceprints',
  '/audit',
  '/compare',
  '/history',
  '/settings',
  '/onboarding',
];

const hasClerk =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_');

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Dev-auth middleware (used when Clerk is not configured): gates protected
 * routes on the presence of the local dev-session cookie.
 */
function devMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();
  const hasSession = !!req.cookies.get('rr_dev_session')?.value;
  if (hasSession) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/sign-in';
  url.searchParams.set('redirect_url', pathname);
  return NextResponse.redirect(url);
}

// Build the exported middleware once, based on configuration.
let handler: NextMiddleware;

if (hasClerk) {
  const isProtectedRoute = createRouteMatcher(
    PROTECTED_PREFIXES.map((p) => `${p}(.*)`),
  );
  handler = clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });
} else {
  handler = devMiddleware;
}

export default handler;

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
};
