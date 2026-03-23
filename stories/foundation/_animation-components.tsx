import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const demoContainer: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border-muted)',
  backgroundColor: 'var(--surface-secondary)',
};

const darkContainer: CSSProperties = {
  ...demoContainer,
  backgroundColor: '#0a0a0a',
  color: '#f5f5f5',
};

const codeBlock: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  backgroundColor: 'var(--surface-secondary)',
  padding: '12px 16px',
  borderRadius: 'var(--border-radius-sm)',
  overflow: 'auto',
  whiteSpace: 'pre',
  margin: '8px 0',
  border: '1px solid var(--border-muted)',
};

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

// ---------------------------------------------------------------------------
// TierBadge — shows which tier an effect belongs to
// ---------------------------------------------------------------------------

export function TierBadge({ tier }: { tier: 'css' | 'gsap' | 'premium' }) {
  const colors = {
    css: { bg: 'var(--background-brand-secondary)', color: '#fff' },
    gsap: { bg: 'var(--background-brand-primary)', color: '#fff' },
    premium: { bg: '#7c3aed', color: '#fff' },
  };
  const labels = { css: 'CSS Only', gsap: 'GSAP', premium: 'Premium JS' };

  return (
    <span style={{ ...badgeStyle, backgroundColor: colors[tier].bg, color: colors[tier].color }}>
      {labels[tier]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// AnimationDemo — wrapper that replays animation on click
// ---------------------------------------------------------------------------

export function AnimationDemo({
  children,
  dark = false,
  height = 200,
  label,
  code,
}: {
  children: ReactNode;
  dark?: boolean;
  height?: number;
  label?: string;
  code?: string;
}) {
  const [key, setKey] = useState(0);

  return (
    <div style={{ marginBottom: 24 }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
          {label}
        </div>
      )}
      <div
        key={key}
        style={{
          ...(dark ? darkContainer : demoContainer),
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
        onClick={() => setKey((k) => k + 1)}
        style={{
          marginTop: 8,
          padding: '4px 12px',
          fontSize: 12,
          border: '1px solid var(--border-muted)',
          borderRadius: 'var(--border-radius-sm)',
          background: 'var(--surface-primary)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        Replay
      </button>
      {code && <pre style={codeBlock}>{code}</pre>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClipRevealDemo — demonstrates clip-path reveals
// ---------------------------------------------------------------------------

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
        background: 'linear-gradient(135deg, var(--background-brand-primary), var(--background-brand-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      .clip-{type}-reveal
    </div>
  );
}

// ---------------------------------------------------------------------------
// GrainDemo — shows grain overlay variants
// ---------------------------------------------------------------------------

export function GrainDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `grain-overlay grain-overlay--${variant}` : 'grain-overlay';
  return (
    <div
      className={cls}
      style={{
        width: '100%',
        height: 160,
        borderRadius: 'var(--border-radius-md)',
        backgroundColor: variant === 'heavy' ? '#0a0a0a' : 'var(--surface-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: variant === 'heavy' ? '#f5f5f5' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        position: 'relative',
      }}
    >
      <span style={{ position: 'relative', zIndex: 2 }}>.{cls.replace(/ /g, '.')}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GlassDemo — glassmorphism showcase
// ---------------------------------------------------------------------------

export function GlassDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `glass--${variant}` : 'glass';
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        borderRadius: 'var(--border-radius-lg)',
        background: 'linear-gradient(135deg, var(--background-brand-primary) 0%, var(--background-brand-secondary) 100%)',
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
          color: variant === 'dark' ? '#f5f5f5' : 'var(--text-primary)',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>.{cls}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Frosted glass effect with backdrop-filter</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextEffectDemo — gradient text, stroke, glow, highlight
// ---------------------------------------------------------------------------

export function TextEffectDemo({ className, label, dark = false }: { className: string; label: string; dark?: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        padding: '24px 32px',
        backgroundColor: dark ? '#0a0a0a' : 'var(--surface-secondary)',
        borderRadius: 'var(--border-radius-md)',
        textAlign: 'center',
        color: dark ? '#f5f5f5' : 'var(--text-primary)',
      }}
    >
      <span
        className={`${className} ${visible ? 'is-visible' : ''}`}
        style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-family-heading)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HoverDemo — interactive hover effects
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// VideoDemo — video background placeholder
// ---------------------------------------------------------------------------

export function VideoDemo({ variant = '' }: { variant?: string }) {
  const cls = variant ? `video-bg video-bg--${variant}` : 'video-bg';
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
        background: '#0a0a0a',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, color: '#fff', textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>.{cls.replace(/ /g, '.')}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {variant === 'gradient' ? 'Top-to-bottom gradient overlay' :
           variant === 'light' ? '20% dark overlay' :
           variant === 'heavy' ? '65% dark overlay' :
           '45% dark overlay (default)'}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionThemeDemo — dark/light/warm/brand sections
// ---------------------------------------------------------------------------

export function SectionThemeDemo({ className, label }: { className: string; label: string }) {
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

// ---------------------------------------------------------------------------
// EffectGrid — grid of demos
// ---------------------------------------------------------------------------

export function EffectGrid({ children, columns = 2 }: { children: ReactNode; columns?: number }) {
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

// ---------------------------------------------------------------------------
// CodeSnippet — formatted code display
// ---------------------------------------------------------------------------

export function CodeSnippet({ code }: { code: string }) {
  return <pre style={codeBlock}>{code}</pre>;
}
