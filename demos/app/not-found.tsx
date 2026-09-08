import Link from 'next/link';
import { Button, ButtonArrow } from '@/components/ui/button';
import { demoList } from '@/config/demos';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.24em] text-brand">404</p>
      <h1 className="mt-5 font-display text-[clamp(2rem,6vw,3.6rem)] font-bold tracking-tight">
        That demo doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        The page you were looking for isn&apos;t here. Pick one of the live demos instead.
      </p>

      <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {demoList.map((demo) => (
          <li key={demo.slug}>
            <Link
              href={`/${demo.slug}`}
              className="inline-flex rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:border-[color:var(--brand)] hover:text-ink"
            >
              {demo.businessName}
            </Link>
          </li>
        ))}
      </ul>

      <Button href="/" className="mt-9" size="lg">
        Back to all demos
        <ButtonArrow />
      </Button>
    </div>
  );
}
