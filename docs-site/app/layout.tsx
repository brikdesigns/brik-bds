import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Brik Design System',
  description:
    'Guidance, foundations, and components for building Brik products and client sites.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-brand-brik" suppressHydrationWarning>
      <body>
        {/* search type 'static' pairs with staticGET in app/api/search/route.ts:
            the client downloads the prebuilt index once and searches in-browser,
            avoiding the serverless cold start that made as-you-type search feel
            broken on first use. */}
        <RootProvider
          theme={{ attribute: ['class', 'data-theme'] }}
          search={{ options: { type: 'static' } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
