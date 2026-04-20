import { useState, type CSSProperties } from 'react';

const mono: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: '12px',
};

const th: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid var(--border-secondary)',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  textAlign: 'left',
};

const td: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-muted)',
  verticalAlign: 'middle',
  fontSize: '13px',
  fontFamily: 'var(--font-family-body)',
  color: 'var(--text-primary)',
};

const code: CSSProperties = {
  ...mono,
  background: 'var(--surface-secondary)',
  padding: '2px 6px',
  borderRadius: '3px',
  color: 'inherit',
};

// ---------------------------------------------------------------------------
// DurationTable + live demo
// ---------------------------------------------------------------------------

interface DurationEntry {
  token: string;
  cssVar: string;
  value: string;
  use: string;
}

const DURATION_TOKENS: DurationEntry[] = [
  { token: 'fast',   cssVar: '--duration-fast',   value: '100ms', use: 'Hover, focus, micro-interactions' },
  { token: 'normal', cssVar: '--duration-normal', value: '200ms', use: 'Buttons, cards, standard transitions' },
  { token: 'slow',   cssVar: '--duration-slow',   value: '300ms', use: 'Modals, sheets, emphasis reveals' },
];

const DURATION_PRIMITIVES = [
  { cssVar: '--duration-100', value: '100ms' },
  { cssVar: '--duration-200', value: '200ms' },
  { cssVar: '--duration-300', value: '300ms' },
  { cssVar: '--duration-400', value: '500ms' },
  { cssVar: '--duration-500', value: '800ms' },
  { cssVar: '--duration-600', value: '1000ms' },
];

function DurationDot({ cssVar }: { cssVar: string }) {
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const replay = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      setKey((k) => k + 1);
      setPlaying(true);
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '28px',
      }}
    >
      <div
        key={key}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'var(--background-brand-primary)',
          opacity: playing ? 1 : 0.3,
          transform: playing ? 'scale(1)' : 'scale(0.6)',
          transition: playing
            ? `opacity var(${cssVar}) var(--ease-out), transform var(${cssVar}) var(--ease-out)`
            : 'none',
          flexShrink: 0,
        }}
      />
      <button
        onClick={replay}
        style={{
          background: 'none',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-sm, 2px)',
          padding: '2px 8px',
          fontSize: '11px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-family-body)',
        }}
      >
        Play
      </button>
    </div>
  );
}

export function DurationTable() {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Token</th>
            <th style={th}>CSS Variable</th>
            <th style={th}>Value</th>
            <th style={th}>Use Case</th>
            <th style={{ ...th, textAlign: 'center' }}>Live</th>
          </tr>
        </thead>
        <tbody>
          {DURATION_TOKENS.map((t) => (
            <tr key={t.cssVar}>
              <td style={td}><code style={code}>{t.token}</code></td>
              <td style={td}><code style={code}>{t.cssVar}</code></td>
              <td style={td}><code style={code}>{t.value}</code></td>
              <td style={{ ...td, color: 'var(--text-secondary)' }}>{t.use}</td>
              <td style={{ ...td, textAlign: 'center' }}><DurationDot cssVar={t.cssVar} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <details style={{ marginTop: 'var(--gap-lg)', fontFamily: 'var(--font-family-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '12px' }}>
          Primitive duration scale (Figma-sourced)
        </summary>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 'var(--gap-sm)' }}>
          <thead>
            <tr>
              <th style={th}>CSS Variable</th>
              <th style={th}>Value</th>
            </tr>
          </thead>
          <tbody>
            {DURATION_PRIMITIVES.map((p) => (
              <tr key={p.cssVar}>
                <td style={td}><code style={code}>{p.cssVar}</code></td>
                <td style={td}><code style={code}>{p.value}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EasingTable + live visualization
// ---------------------------------------------------------------------------

interface EasingEntry {
  token: string;
  cssVar: string;
  bezier: string;
  use: string;
}

const EASING_TOKENS: EasingEntry[] = [
  {
    token: 'ease-out',
    cssVar: '--ease-out',
    bezier: 'cubic-bezier(0.16, 1, 0.3, 1)',
    use: 'Decelerate — most UI transitions',
  },
  {
    token: 'ease-in',
    cssVar: '--ease-in',
    bezier: 'cubic-bezier(0.7, 0, 0.84, 0)',
    use: 'Accelerate — exits, collapses',
  },
  {
    token: 'ease-in-out',
    cssVar: '--ease-in-out',
    bezier: 'cubic-bezier(0.65, 0, 0.35, 1)',
    use: 'Symmetric — looping, continuous',
  },
  {
    token: 'ease-spring',
    cssVar: '--ease-spring',
    bezier: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    use: 'Overshoot bounce — pop-in, badge appear',
  },
];

function EasingDemo({ cssVar, bezier }: { cssVar: string; bezier: string }) {
  const [key, setKey] = useState(0);
  const [playing, setPlaying] = useState(false);

  const replay = () => {
    setPlaying(false);
    requestAnimationFrame(() => {
      setKey((k) => k + 1);
      setPlaying(true);
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '80px',
          height: '20px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px',
        }}
      >
        <div
          key={key}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: playing ? 'translateX(64px) translateY(-50%)' : 'translateX(0) translateY(-50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'var(--background-brand-primary)',
            transition: playing
              ? `transform var(--duration-slow, 300ms) var(${cssVar}, ${bezier})`
              : 'none',
          }}
        />
      </div>
      <button
        onClick={replay}
        style={{
          background: 'none',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--border-radius-sm, 2px)',
          padding: '2px 8px',
          fontSize: '11px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-family-body)',
        }}
      >
        Play
      </button>
    </div>
  );
}

export function EasingTable() {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Token</th>
            <th style={th}>CSS Variable</th>
            <th style={th}>Bezier Value</th>
            <th style={th}>Use Case</th>
            <th style={{ ...th, textAlign: 'center' }}>Live</th>
          </tr>
        </thead>
        <tbody>
          {EASING_TOKENS.map((t) => (
            <tr key={t.cssVar}>
              <td style={td}><code style={code}>{t.token}</code></td>
              <td style={td}><code style={code}>{t.cssVar}</code></td>
              <td style={{ ...td, ...mono, fontSize: '11px' }}>{t.bezier}</td>
              <td style={{ ...td, color: 'var(--text-secondary)' }}>{t.use}</td>
              <td style={{ ...td }}><EasingDemo cssVar={t.cssVar} bezier={t.bezier} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KeyframeTable + miniature live preview
// ---------------------------------------------------------------------------

interface KeyframeEntry {
  name: string;
  cssName: string;
  animates: string;
  suggestedClass: string;
}

const KEYFRAMES: KeyframeEntry[] = [
  {
    name: 'bds-fade-in',
    cssName: 'bds-fade-in',
    animates: 'opacity 0→1, scale 0.98→1',
    suggestedClass: '.bds-enter-fade',
  },
  {
    name: 'bds-slide-up',
    cssName: 'bds-slide-up',
    animates: 'opacity 0→1, translateY 8px→0',
    suggestedClass: '.bds-enter-slide-up',
  },
  {
    name: 'bds-slide-down',
    cssName: 'bds-slide-down',
    animates: 'opacity 0→1, translateY -8px→0',
    suggestedClass: '.bds-enter-slide-down',
  },
  {
    name: 'bds-pop',
    cssName: 'bds-pop',
    animates: 'scale 0→1.15→1, opacity 0→1',
    suggestedClass: '.bds-enter-pop',
  },
  {
    name: 'bds-pulse',
    cssName: 'bds-pulse',
    animates: 'opacity 1→0.5→1, scale 1→1.4→1 (infinite)',
    suggestedClass: '.bds-anim-pulse',
  },
  {
    name: 'bds-shake',
    cssName: 'bds-shake',
    animates: 'rotation oscillation ±12°→0°',
    suggestedClass: '.bds-anim-shake',
  },
  {
    name: 'bds-spin',
    cssName: 'bds-spin',
    animates: 'rotate 360° (infinite)',
    suggestedClass: '.bds-anim-spin',
  },
  {
    name: 'bds-shimmer',
    cssName: 'bds-shimmer',
    animates: 'background-position sweep (infinite)',
    suggestedClass: '.bds-anim-shimmer',
  },
];

function KeyframeMiniPreview({ name }: { name: string }) {
  const [key, setKey] = useState(0);
  const isPulse = name === 'bds-pulse';
  const isSpin = name === 'bds-spin';
  const isShimmer = name === 'bds-shimmer';

  const replay = () => {
    setKey((k) => k + 1);
  };

  const shimmerBase: CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--border-radius-sm, 2px)',
    background: 'linear-gradient(90deg, var(--surface-secondary) 25%, var(--border-muted) 50%, var(--surface-secondary) 75%)',
    backgroundSize: '400% 100%',
  };

  const dotBase: CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'var(--background-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const squareBase: CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: 'var(--border-radius-sm, 2px)',
    background: 'var(--background-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const animStyle: CSSProperties = isShimmer
    ? { ...shimmerBase, animation: `bds-shimmer 1.5s linear infinite` }
    : isPulse
    ? { ...dotBase, animation: `bds-pulse 1.4s var(--ease-in-out) infinite` }
    : isSpin
    ? { ...squareBase, animation: `bds-spin 0.8s linear infinite` }
    : {
        ...squareBase,
        animation: `${name} var(--duration-slow, 300ms) var(--ease-out, ease) both`,
      };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div key={key} style={animStyle} />
      </div>
      {!isPulse && !isSpin && !isShimmer && (
        <button
          onClick={replay}
          style={{
            background: 'none',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--border-radius-sm, 2px)',
            padding: '2px 8px',
            fontSize: '11px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-family-body)',
          }}
        >
          Replay
        </button>
      )}
    </div>
  );
}

export function KeyframeTable() {
  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Keyframe Name</th>
            <th style={th}>What It Animates</th>
            <th style={th}>Utility Class</th>
            <th style={{ ...th, textAlign: 'center' }}>Preview</th>
          </tr>
        </thead>
        <tbody>
          {KEYFRAMES.map((k) => (
            <tr key={k.name}>
              <td style={td}><code style={code}>{k.cssName}</code></td>
              <td style={{ ...td, color: 'var(--text-secondary)', fontSize: '12px' }}>{k.animates}</td>
              <td style={td}><code style={code}>{k.suggestedClass}</code></td>
              <td style={{ ...td, minWidth: '120px' }}><KeyframeMiniPreview name={k.cssName} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontFamily: 'var(--font-family-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: 'var(--gap-sm)' }}>
        All keyframes are defined in <code style={code}>tokens/animations.css</code>. Reference them by name in component CSS
        or via the utility classes in <code style={code}>tokens/motion-classes.css</code>.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UtilityClassTable
// ---------------------------------------------------------------------------

interface UtilityEntry {
  className: string;
  resolvedCSS: string;
  group: string;
}

const UTILITY_CLASSES: UtilityEntry[] = [
  // Entrance
  { className: '.bds-enter-fade',       resolvedCSS: 'animation: bds-fade-in var(--duration-normal) var(--ease-out) both',       group: 'Entrance' },
  { className: '.bds-enter-slide-up',   resolvedCSS: 'animation: bds-slide-up var(--duration-normal) var(--ease-out) both',     group: 'Entrance' },
  { className: '.bds-enter-slide-down', resolvedCSS: 'animation: bds-slide-down var(--duration-normal) var(--ease-out) both',   group: 'Entrance' },
  { className: '.bds-enter-pop',        resolvedCSS: 'animation: bds-pop var(--duration-slow) var(--ease-spring) both',         group: 'Entrance' },
  // Attention
  { className: '.bds-anim-pulse',       resolvedCSS: 'animation: bds-pulse 1.4s var(--ease-in-out) infinite',                   group: 'Attention' },
  { className: '.bds-anim-shake',       resolvedCSS: 'animation: bds-shake 0.5s var(--ease-out)',                               group: 'Attention' },
  { className: '.bds-anim-bounce',      resolvedCSS: 'animation: bds-pop var(--duration-slow) var(--ease-spring)',              group: 'Attention' },
  // State
  { className: '.bds-anim-spin',        resolvedCSS: 'animation: bds-spin 0.8s linear infinite',                               group: 'State' },
  { className: '.bds-anim-shimmer',     resolvedCSS: 'animation: bds-shimmer 1.5s linear infinite',                            group: 'State' },
  // Stagger
  { className: '.bds-stagger-1',        resolvedCSS: 'animation-delay: var(--stagger-1) → 0ms',                                group: 'Stagger' },
  { className: '.bds-stagger-2',        resolvedCSS: 'animation-delay: var(--stagger-2) → 50ms',                               group: 'Stagger' },
  { className: '.bds-stagger-3',        resolvedCSS: 'animation-delay: var(--stagger-3) → 100ms',                              group: 'Stagger' },
  { className: '.bds-stagger-4',        resolvedCSS: 'animation-delay: var(--stagger-4) → 150ms',                              group: 'Stagger' },
  { className: '.bds-stagger-5',        resolvedCSS: 'animation-delay: var(--stagger-5) → 200ms',                              group: 'Stagger' },
  { className: '.bds-stagger-6',        resolvedCSS: 'animation-delay: var(--stagger-6) → 250ms',                              group: 'Stagger' },
];

export function UtilityClassTable() {
  const groups = ['Entrance', 'Attention', 'State', 'Stagger'];

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      {groups.map((group) => {
        const rows = UTILITY_CLASSES.filter((c) => c.group === group);
        return (
          <div key={group} style={{ marginBottom: 'var(--gap-xl)' }}>
            <h4
              style={{
                fontFamily: 'var(--font-family-heading)',
                fontSize: 'var(--body-md, 14px)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 'var(--gap-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {group}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Class</th>
                  <th style={th}>Resolved CSS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.className}>
                    <td style={{ ...td, width: '220px' }}><code style={code}>{row.className}</code></td>
                    <td style={{ ...td, ...mono, fontSize: '11px', color: 'var(--text-muted)' }}>{row.resolvedCSS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StaggerTable — shows stagger token values with live demo
// ---------------------------------------------------------------------------

export function StaggerDemo() {
  const [key, setKey] = useState(0);

  const replay = () => setKey((k) => k + 1);

  const steps = [
    { cls: 'bds-stagger-1', delay: '0ms' },
    { cls: 'bds-stagger-2', delay: '50ms' },
    { cls: 'bds-stagger-3', delay: '100ms' },
    { cls: 'bds-stagger-4', delay: '150ms' },
    { cls: 'bds-stagger-5', delay: '200ms' },
    { cls: 'bds-stagger-6', delay: '250ms' },
  ];

  return (
    <div style={{ marginBottom: 'var(--padding-xl, 32px)' }}>
      <div style={{ display: 'flex', gap: 'var(--gap-sm)', alignItems: 'flex-end', marginBottom: 'var(--gap-md)' }}>
        {steps.map((s, i) => (
          <div
            key={`${key}-${i}`}
            style={{
              width: '28px',
              height: `${(i + 1) * 10 + 20}px`,
              borderRadius: 'var(--border-radius-sm, 2px)',
              background: 'var(--background-brand-primary)',
              animation: 'bds-fade-in var(--duration-normal, 200ms) var(--ease-out) both',
              animationDelay: s.delay,
              opacity: 0,
            }}
          />
        ))}
        <button
          onClick={replay}
          style={{
            background: 'none',
            border: '1px solid var(--border-secondary)',
            borderRadius: 'var(--border-radius-sm, 2px)',
            padding: '4px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-family-body)',
            marginLeft: 'var(--gap-sm)',
          }}
        >
          Replay
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>CSS Variable</th>
            <th style={th}>Class</th>
            <th style={th}>Value</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => (
            <tr key={s.cls}>
              <td style={td}><code style={code}>--{s.cls.replace('bds-stagger', 'stagger')}</code></td>
              <td style={td}><code style={code}>.{s.cls}</code></td>
              <td style={td}><code style={code}>{s.delay}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
