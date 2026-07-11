export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated {updated}</p>
      <div className="prose-readroom mt-8 space-y-6 text-[0.95rem] leading-relaxed text-ink-soft [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-1.5">
        {children}
      </div>
    </div>
  );
}
