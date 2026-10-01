import type { Meta, StoryObj } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';
import { themeMetadata, ThemeNumber } from '../tokens';

/**
 * ThemeSwitcher Demo
 *
 * Demonstrates the BDS theme system. Use toolbar to switch between 9 themes.
 * Each theme bundles color palette, typography, and spacing.
 */

function ThemeDemo({ currentTheme = 'brik' as ThemeNumber }) {
  const meta = themeMetadata[currentTheme] || themeMetadata['brik'];

  return (
    <div
      style={{
        padding: 'var(--bds-padding-lg)',
        fontFamily: 'var(--bds-font-family-body)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--bds-font-family-heading)',
          fontSize: 'var(--bds-heading-xxl)',
          marginBottom: 'var(--bds-padding-md)',
        }}
      >
        BDS Theme Switcher
      </h1>

      <p
        style={{
          fontSize: 'var(--bds-body-lg)',
          color: 'var(--bds-text-secondary)',
          marginBottom: 'var(--bds-padding-lg)',
        }}
      >
        Use the toolbar controls above to switch themes.
      </p>

      {/* Current Theme Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--bds-gap-md)',
          marginBottom: 'var(--bds-padding-xl)',
        }}
      >
        <ThemeCard label="Theme" value={currentTheme} />
        <ThemeCard label="Name" value={meta.name} />
        <ThemeCard label="Mode" value={meta.isDark ? 'Dark' : 'Light'} />
      </div>

      <p
        style={{
          color: 'var(--bds-text-muted)',
          marginBottom: 'var(--bds-padding-xl)',
          fontStyle: 'italic',
        }}
      >
        {meta.description}
      </p>

      {/* Color Swatches */}
      <SectionTitle>Page and surface</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--bds-gap-md)', marginBottom: 'var(--bds-padding-lg)' }}>
        <ColorSwatch name="page-primary" />
        <ColorSwatch name="page-secondary" />
        <ColorSwatch name="surface-primary" />
        <ColorSwatch name="surface-secondary" />
        <ColorSwatch name="surface-nav" />
      </div>

      <SectionTitle>Brand and background</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--bds-gap-md)', marginBottom: 'var(--bds-padding-lg)' }}>
        <ColorSwatch name="background-brand-primary" />
        <ColorSwatch name="background-brand-secondary" />
        <ColorSwatch name="background-primary" />
        <ColorSwatch name="background-secondary" />
      </div>

      <SectionTitle>Text</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--bds-gap-md)', marginBottom: 'var(--bds-padding-lg)' }}>
        <ColorSwatch name="text-primary" isText />
        <ColorSwatch name="text-secondary" isText />
        <ColorSwatch name="text-muted" isText />
        <ColorSwatch name="text-brand-primary" isText />
        <ColorSwatch name="text-inverse" isText />
      </div>

      {/* Typography Demo */}
      <SectionTitle>Typography</SectionTitle>
      <div
        style={{
          backgroundColor: 'var(--bds-surface-secondary)',
          padding: 'var(--bds-padding-md)',
          borderRadius: 'var(--bds-border-radius-md)',
          marginBottom: 'var(--bds-padding-lg)',
        }}
      >
        <p style={{ fontFamily: 'var(--bds-font-family-display)', fontSize: 'var(--bds-heading-xl)', marginBottom: 'var(--bds-gap-sm)' }}>
          Display Font
        </p>
        <p style={{ fontFamily: 'var(--bds-font-family-heading)', fontSize: 'var(--bds-heading-lg)', marginBottom: 'var(--bds-gap-sm)' }}>
          Heading Font
        </p>
        <p style={{ fontFamily: 'var(--bds-font-family-body)', fontSize: 'var(--bds-body-md)', marginBottom: 'var(--bds-gap-sm)' }}>
          Body font for paragraphs and content
        </p>
        <p style={{ fontFamily: 'var(--bds-font-family-label)', fontSize: 'var(--bds-label-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Label Font
        </p>
      </div>

      {/* Buttons */}
      <SectionTitle>Buttons</SectionTitle>
      <div style={{ display: 'flex', gap: 'var(--bds-gap-lg)', flexWrap: 'wrap', marginBottom: 'var(--bds-padding-lg)' }}>
        <button
          style={{
            padding: 'var(--bds-gap-md) var(--bds-padding-sm)',
            backgroundColor: 'var(--bds-background-brand-primary)',
            color: 'var(--bds-text-inverse)',
            border: 'none',
            borderRadius: 'var(--bds-border-radius-md)',
            fontFamily: 'var(--bds-font-family-label)',
            fontSize: 'var(--bds-body-md)',
            fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
            cursor: 'pointer',
          }}
        >
          Primary
        </button>
        <button
          style={{
            padding: 'var(--bds-gap-md) var(--bds-padding-sm)',
            backgroundColor: 'transparent',
            color: 'var(--bds-text-brand-primary)',
            border: 'var(--bds-border-width-lg) solid var(--bds-border-brand-primary)',
            borderRadius: 'var(--bds-border-radius-md)',
            fontFamily: 'var(--bds-font-family-label)',
            fontSize: 'var(--bds-body-md)',
            fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
            cursor: 'pointer',
          }}
        >
          Secondary
        </button>
        <button
          style={{
            padding: 'var(--bds-gap-md) var(--bds-padding-sm)',
            backgroundColor: 'var(--bds-surface-secondary)',
            color: 'var(--bds-text-primary)',
            border: 'var(--bds-border-width-lg) solid var(--bds-border-secondary)',
            borderRadius: 'var(--bds-border-radius-md)',
            fontFamily: 'var(--bds-font-family-label)',
            fontSize: 'var(--bds-body-md)',
            cursor: 'pointer',
          }}
        >
          Tertiary
        </button>
      </div>

      {/* All Themes Grid */}
      <SectionTitle>All available themes</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--bds-gap-md)' }}>
        {(['brik', 'brik-dark', 'client-sim'] as ThemeNumber[]).map((num) => (
          <ThemePreview key={num} themeNum={num} isActive={num === currentTheme} />
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--bds-font-family-heading)',
        fontSize: 'var(--bds-heading-lg)',
        marginBottom: 'var(--bds-gap-lg)',
        marginTop: 'var(--bds-padding-lg)',
      }}
    >
      {children}
    </h2>
  );
}

function ThemeCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bds-surface-secondary)',
        padding: 'var(--bds-padding-sm)',
        borderRadius: 'var(--bds-border-radius-md)',
        border: 'var(--bds-border-width-lg) solid var(--bds-border-secondary)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--bds-label-sm)',
          color: 'var(--bds-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--bds-gap-xs)',
          fontFamily: 'var(--bds-font-family-label)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--bds-body-lg)',
          fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
          fontFamily: 'var(--bds-font-family-heading)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ColorSwatch({ name, isText }: { name: string; isText?: boolean }) {
  const varName = `--${name}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--bds-gap-xs)' }}>
      <div
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: isText ? 'var(--bds-surface-primary)' : `var(${varName})`,
          borderRadius: 'var(--bds-border-radius-md)',
          border: 'var(--bds-border-width-lg) solid var(--bds-border-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isText && (
          <span style={{ color: `var(${varName})`, fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number, fontSize: 'var(--bds-body-lg)' }}>
            Aa
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 'var(--bds-body-xs)',
          color: 'var(--bds-text-muted)',
          fontFamily: 'var(--bds-font-family-label)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
    </div>
  );
}

function ThemePreview({ themeNum, isActive }: { themeNum: ThemeNumber; isActive: boolean }) {
  const meta = themeMetadata[themeNum];

  return (
    <div
      style={{
        padding: 'var(--bds-gap-lg)',
        borderRadius: 'var(--bds-border-radius-md)',
        border: isActive ? '2px solid var(--bds-border-brand-primary)' : 'var(--bds-border-width-lg) solid var(--bds-border-secondary)',
        backgroundColor: 'var(--bds-surface-secondary)',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <div style={{ fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number, marginBottom: 'var(--bds-gap-xs)', fontSize: 'var(--bds-body-md)' }}>
        {themeNum}: {meta.name}
      </div>
      <div style={{ fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-muted)' }}>
        {meta.isDark ? 'Dark' : 'Light'}
      </div>
      {isActive && (
        <div style={{ fontSize: 'var(--bds-body-sm)', color: 'var(--bds-text-brand-primary)', fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number, marginTop: 'var(--bds-gap-xs)' }}>
          Active
        </div>
      )}
    </div>
  );
}

/**
 * Live theme demo — reads the active theme from the toolbar global.
 * @summary Theme system demo driven by the toolbar
 */
const meta: Meta<typeof ThemeDemo> = {
  title: 'Overview/Theme Switcher',
  component: ThemeDemo,
  tags: ['surface-shared'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: true, iframeHeight: 'auto' },
      container: ({ children }: { children: React.ReactNode }) => <div style={{ margin: 0, padding: 0, maxWidth: 'none' }}>{children}</div>,
    },
  },
  render: () => {
    const [globals] = useGlobals();
    const currentTheme = (globals.themeNumber || 'brik') as ThemeNumber;
    return <ThemeDemo currentTheme={currentTheme} />;
  },
};

export default meta;
type Story = StoryObj<typeof ThemeDemo>;

/**
 * Switch themes with the toolbar `theme` global — per-theme story exports would
 * duplicate that Q1 axis (ADR-010 anti-pattern), so this is the only story.
 *
 * @summary Theme demo — switch via the toolbar global
 */
export const Default: Story = {};
