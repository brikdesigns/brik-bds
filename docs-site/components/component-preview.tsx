'use client';

import { useState, type ReactNode } from 'react';

interface ComponentPreviewProps {
  /** The live BDS component(s) to render in the preview frame. */
  children: ReactNode;
  /** Source code shown in the Code tab. Pass the literal JSX string. */
  code: string;
  /** Override the default 200px frame minimum height. */
  minHeight?: number;
}

/**
 * Two-tab preview: live render on the left, source code on the right.
 * The frame uses BDS surface tokens so the preview canvas stays on-brand
 * regardless of the docs site's own theme.
 */
export function ComponentPreview({
  children,
  code,
  minHeight = 200,
}: ComponentPreviewProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-fd-border">
      <div className="flex items-center justify-between border-b border-fd-border bg-fd-muted/40 px-3 py-1.5">
        <div className="flex gap-1">
          <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
            Preview
          </TabButton>
          <TabButton active={tab === 'code'} onClick={() => setTab('code')}>
            Code
          </TabButton>
        </div>
        {tab === 'code' && (
          <button
            onClick={onCopy}
            className="rounded px-2 py-0.5 text-xs font-medium text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      {tab === 'preview' ? (
        <div
          className="flex flex-wrap items-center gap-3 p-6"
          style={{
            minHeight,
            background: 'var(--docs-preview-bg)',
          }}
        >
          {children}
        </div>
      ) : (
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded px-2.5 py-1 text-xs font-medium transition ' +
        (active
          ? 'bg-fd-background text-fd-foreground shadow-sm'
          : 'text-fd-muted-foreground hover:text-fd-foreground')
      }
    >
      {children}
    </button>
  );
}
