'use client';

import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';

/**
 * Wraps children in ClerkProvider only when Clerk is configured. In local/demo
 * mode (no publishable key) it renders children directly so the app runs
 * end-to-end on the dev-auth fallback without a Clerk account.
 */
export function AppProviders({
  children,
  clerkEnabled,
}: {
  children: ReactNode;
  clerkEnabled: boolean;
}) {
  if (!clerkEnabled) return <>{children}</>;
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#111111',
          colorText: '#101014',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-sans)',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
