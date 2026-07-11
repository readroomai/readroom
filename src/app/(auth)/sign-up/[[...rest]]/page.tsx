import type { Metadata } from 'next';
import { capabilities } from '@/lib/env';
import { DevAuthForm } from '@/components/auth/dev-auth-form';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignUpPage() {
  if (capabilities.clerk) {
    const { SignUp } = await import('@clerk/nextjs');
    return (
      <div className="flex justify-center">
        <SignUp signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
      </div>
    );
  }
  return <DevAuthForm mode="sign-up" />;
}
