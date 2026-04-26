import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
        Brik Design System
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-fd-muted-foreground">
        Foundations, components, and patterns for building Brik products and
        client sites. Storybook is the playground; this is the guidance layer.
      </p>
      <div className="flex gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-fd-primary px-5 py-2.5 font-medium text-fd-primary-foreground transition hover:opacity-90"
        >
          Read the docs
        </Link>
        <a
          href="https://storybook.brikdesigns.com"
          className="rounded-md border border-fd-border px-5 py-2.5 font-medium transition hover:bg-fd-muted"
        >
          Open Storybook
        </a>
      </div>
    </main>
  );
}
