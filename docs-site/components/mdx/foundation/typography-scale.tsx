'use client';

import { useEffect, useState } from 'react';

interface TypographyScaleProps {
  title?: string;
  /** Map of step name → value (e.g. `{ "100": "16px", "200": "18px" }`). */
  scale: Record<string, string>;
  /** CSS variable prefix used to render the token name (e.g. `--font-size`). */
  prefix: string;
}

/**
 * Live preview of a numeric font-size scale. Each row renders sample text
 * sized at the actual value so the scale is comparable at a glance.
 */
export function TypographyScale({ title, scale, prefix }: TypographyScaleProps) {
  const entries = Object.entries(scale).sort(
    (a, b) => parseFloat(a[1]) - parseFloat(b[1])
  );

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div className="flex flex-col gap-0.5">
        {entries.map(([step, value]) => (
          <div
            key={step}
            className="flex items-baseline gap-4 border-b border-fd-border py-1.5"
          >
            <code
              className="text-xs"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                width: '140px',
                flexShrink: 0,
                color: 'var(--text-muted, #6b7280)',
              }}
            >
              {prefix}-{step}
            </code>
            <span
              style={{
                fontSize: value,
                lineHeight: 1.2,
                fontFamily: 'var(--font-family-body, system-ui)',
                color: 'var(--text-primary, #111827)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '400px',
              }}
            >
              {parseFloat(value) > 60 ? 'Ag' : 'The quick brown fox'}
            </span>
            <span
              className="text-xs"
              style={{
                color: 'var(--text-muted, #6b7280)',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                flexShrink: 0,
                marginLeft: 'auto',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FontFamilyShowcaseProps {
  families: Array<{ name: string; cssVar: string }>;
}

/**
 * Renders sample text in each provided font-family CSS var. Resolves the
 * computed value for display, so theme switches refresh the labels.
 */
export function FontFamilyShowcase({ families }: FontFamilyShowcaseProps) {
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      requestAnimationFrame(() => {
        const next: Record<string, string> = {};
        families.forEach((f) => {
          next[f.cssVar] = getComputedStyle(document.body)
            .getPropertyValue(f.cssVar)
            .trim();
        });
        setResolved(next);
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, [families]);

  return (
    <div className="my-6 flex flex-col gap-4">
      {families.map((f) => (
        <div
          key={f.cssVar}
          className="rounded-md border border-fd-border p-4"
          style={{ background: 'var(--surface-secondary, #f9fafb)' }}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
            {f.name}
          </div>
          <div
            style={{
              fontFamily: `var(${f.cssVar})`,
              fontSize: '28px',
              color: 'var(--text-primary, #111827)',
              marginBottom: '4px',
            }}
          >
            ABCDEFGHIJKLM abcdefghijklm 0123456789
          </div>
          <code
            className="text-[11px]"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              color: 'var(--text-muted, #6b7280)',
            }}
          >
            {f.cssVar}
            {resolved[f.cssVar] ? ` → ${resolved[f.cssVar]}` : ''}
          </code>
        </div>
      ))}
    </div>
  );
}

interface SemanticTypographyTableProps {
  title?: string;
  /** List of semantic token names (e.g. `['heading-tiny', 'heading-sm']`). */
  tokens: string[];
}

/**
 * Render each named token at its actual font-size by reading `var(--{name})`.
 * Each row resolves the computed value and shows it alongside the sample text.
 */
export function SemanticTypographyTable({ title, tokens }: SemanticTypographyTableProps) {
  const [resolved, setResolved] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      requestAnimationFrame(() => {
        const next: Record<string, string> = {};
        tokens.forEach((name) => {
          next[name] = getComputedStyle(document.body)
            .getPropertyValue(`--${name}`)
            .trim();
        });
        setResolved(next);
      });
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, [tokens]);

  return (
    <div className="my-6">
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      <div className="flex flex-col gap-0.5">
        {tokens.map((name) => {
          const cssVar = `--${name}`;
          return (
            <div
              key={name}
              className="flex items-baseline gap-4 border-b border-fd-border py-2"
            >
              <code
                className="text-xs"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  width: '200px',
                  flexShrink: 0,
                  color: 'var(--text-muted, #6b7280)',
                }}
              >
                {cssVar}
              </code>
              <span
                style={{
                  fontSize: `var(${cssVar})`,
                  lineHeight: 1.3,
                  fontFamily: 'var(--font-family-body, system-ui)',
                  color: 'var(--text-primary, #111827)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                The quick brown fox
              </span>
              <code
                className="text-[11px]"
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  color: 'var(--text-muted, #6b7280)',
                  flexShrink: 0,
                }}
              >
                {resolved[name] || '...'}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface FontWeightShowcaseProps {
  /** Map of weight name → numeric value (e.g. `{ "regular": "400" }`). */
  weights: Record<string, string>;
}

export function FontWeightShowcase({ weights }: FontWeightShowcaseProps) {
  const entries = Object.entries(weights).sort((a, b) => parseInt(a[1]) - parseInt(b[1]));

  return (
    <div className="my-6 flex flex-col gap-0.5">
      {entries.map(([name, value]) => (
        <div
          key={name}
          className="flex items-baseline gap-4 border-b border-fd-border py-1.5"
        >
          <code
            className="text-xs"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              width: '200px',
              flexShrink: 0,
              color: 'var(--text-muted, #6b7280)',
            }}
          >
            --font-weight-{name}
          </code>
          <span
            style={{
              fontWeight: parseInt(value),
              fontSize: '18px',
              fontFamily: 'var(--font-family-body, system-ui)',
              color: 'var(--text-primary, #111827)',
            }}
          >
            The quick brown fox ({value})
          </span>
        </div>
      ))}
    </div>
  );
}
