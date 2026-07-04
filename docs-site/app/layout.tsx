import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { DevFeedbackWidget } from '@brikdesigns/bds';
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
        <RootProvider theme={{ attribute: ['class', 'data-theme'] }}>
          {children}
        </RootProvider>
        {/* Always-on feedback capture → /api/feedback → Notion Backlog.
            No BrikDevBar on the docs site, so render the standalone FAB. */}
        <DevFeedbackWidget
          endpoint="/api/feedback"
          variant="fab"
          contextLabel="Page"
          fabPosition={{ bottom: '16px', right: '16px' }}
        />
      </body>
    </html>
  );
}
