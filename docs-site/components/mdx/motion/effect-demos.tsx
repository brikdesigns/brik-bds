'use client';

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';

const demoFrame: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-muted)',
  backgroundColor: 'var(--surface-secondary)',
};

const darkFrame: CSSProperties = {
  ...demoFrame,
  backgroundColor: 'var(--surface-inverse)',
  color: 'var(--text-on-color-dark)',
};

const replayButton: CSSProperties = {
  marginTop: 8,
  padding: '4px 12px',
  fontSize: 12,
  border: '1px solid var(--border-muted)',
  borderRadius: 'var(--border-radius-sm)',
  background: 'var(--surface-primary)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

/** Responsive grid wrapper for a row of demo tiles. */
export function EffectGrid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: number;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 16,
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

/** Frame with replay button so visitors can re-trigger the wrapped animation. */
export function AnimationDemo({
  children,
  dark = false,
  height = 200,
  label,
}: {
  children: ReactNode;
  dark?: boolean;
  height?: number;
  label?: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 8,
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </div>
      )}
      <div
        key={key}
        style={{
          ...(dark ? darkFrame : demoFrame),
          minHeight: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        style={replayButton}
      >
        Replay
      </button>
    </div>
  );
}

/** Demonstrates a `clip-{type}-reveal` class. Toggles `is-visible` after mount. */
export function ClipRevealDemo({ type }: { type: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`clip-${type}-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 'var(--border-radius-md)',
        background:
          'linear-gradient(135deg, var(--background-brand-primary), var(--background-brand-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-on-color-dark)',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      .clip-{type}-reveal
    </div>
  );
}

/** Tile demonstrating a `grain-overlay[-{variant}]` class. */
export function GrainDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `grain-overlay grain-overlay--${variant}` : 'grain-overlay';
  const isHeavy = variant === 'heavy';
  return (
    <div
      className={cls}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 'var(--border-radius-md)',
        backgroundColor: isHeavy ? 'var(--surface-inverse)' : 'var(--surface-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isHeavy ? 'var(--text-on-color-dark)' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        position: 'relative',
      }}
    >
      <span style={{ position: 'relative', zIndex: 2 }}>.{cls.replace(/ /g, '.')}</span>
    </div>
  );
}

/** Tile demonstrating a `glass[--{variant}]` class on a brand-gradient backdrop. */
export function GlassDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `glass--${variant}` : 'glass';
  const isDark = variant === 'dark';
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        borderRadius: 'var(--border-radius-lg)',
        background:
          'linear-gradient(135deg, var(--background-brand-primary) 0%, var(--background-brand-secondary) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
      }}
    >
      <div
        className={cls}
        style={{
          padding: '24px 32px',
          borderRadius: 16,
          textAlign: 'center',
          color: isDark ? 'var(--text-on-color-dark)' : 'var(--text-primary)',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>.{cls}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Frosted glass effect with backdrop-filter
        </div>
      </div>
    </div>
  );
}

/** Heading-tier text effect demo (gradient, stroke, glow, highlight). */
export function TextEffectDemo({
  className,
  label,
  dark = false,
}: {
  className: string;
  label: string;
  dark?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        padding: '24px 32px',
        backgroundColor: dark ? 'var(--surface-inverse)' : 'var(--surface-secondary)',
        borderRadius: 'var(--border-radius-md)',
        textAlign: 'center',
        color: dark ? 'var(--text-on-color-dark)' : 'var(--text-primary)',
      }}
    >
      <span
        className={`${className} ${visible ? 'is-visible' : ''}`}
        style={{
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'var(--font-family-heading)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Hover-effect tile. The wrapped class drives the actual animation. */
export function HoverDemo({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={className}
      style={{
        padding: '16px 24px',
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border-muted)',
        borderRadius: 'var(--border-radius-md)',
        textAlign: 'center',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: 14,
      }}
    >
      {label} — hover me
    </div>
  );
}

/** Static placeholder for `video-bg[--{variant}]` overlay variants. */
export function VideoDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `video-bg video-bg--${variant}` : 'video-bg';
  const blurb =
    variant === 'gradient' ? 'Top-to-bottom gradient overlay'
    : variant === 'light' ? '20% dark overlay'
    : variant === 'heavy' ? '65% dark overlay'
    : '45% dark overlay (default)';

  return (
    <div
      className={cls}
      style={{
        width: '100%',
        height: 240,
        borderRadius: 'var(--border-radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface-inverse)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, var(--background-brand-secondary) 0%, var(--background-brand-primary) 100%)',
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          color: 'var(--text-on-color-dark)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
          .{cls.replace(/ /g, '.')}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{blurb}</div>
      </div>
    </div>
  );
}

/** Section theming preset — dark/light/warm/brand backgrounds. */
export function SectionThemeDemo({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div
      className={className}
      style={{
        padding: '32px 24px',
        borderRadius: 'var(--border-radius-md)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>.{className}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{label}</div>
    </div>
  );
}
