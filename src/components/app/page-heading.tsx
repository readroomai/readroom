export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="serif text-[2rem] leading-tight text-ink sm:text-[2.4rem]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-[0.95rem] text-ink-soft">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
