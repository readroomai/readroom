import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { getIdentity } from '@/lib/auth';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await getIdentity();
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper">
      <SiteHeader authed={!!identity} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
