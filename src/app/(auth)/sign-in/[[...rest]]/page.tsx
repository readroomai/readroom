import type { Metadata } from 'next';
import { capabilities } from '@/lib/env';
import { DevAuthForm } from '@/components/auth/dev-auth-form';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  if (capabilities.clerk) {
    const { SignIn } = await import('@clerk/nextjs');
    return (
      <div className="flex justify-center">
        <SignIn signUpUrl="/sign-up" forceRedirectUrl="/onboarding" />
      </div>
    );
  }
  return <DevAuthForm mode="sign-in" />;
}
