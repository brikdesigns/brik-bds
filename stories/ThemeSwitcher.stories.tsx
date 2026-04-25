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
        padding: 'var(--padding-lg)',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-family-heading)',
          fontSize: 'var(--heading-xxl)',
          marginBottom: 'var(--padding-md)',
        }}
      >
        BDS Theme Switcher
      </h1>

      <p
        style={{
          fontSize: 'var(--body-lg)',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--padding-lg)',
        }}
      >
        Use the toolbar controls above to switch themes.
      </p>

      {/* Current Theme Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--gap-md)',
          marginBottom: 'var(--padding-xl)',
        }}
      >
        <ThemeCard label="Theme" value={currentTheme} />
        <ThemeCard label="Name" value={meta.name} />
        <ThemeCard label="Mode" value={meta.isDark ? 'Dark' : 'Light'} />
      </div>

      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: 'var(--padding-xl)',
          fontStyle: 'italic',
        }}
      >
        {meta.description}
      </p>

      {/* Color Swatches */}
      <SectionTitle>Page and surface</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--gap-md)', marginBottom: 'var(--padding-lg)' }}>
        <ColorSwatch name="page-primary" />
        <ColorSwatch name="page-secondary" />
        <ColorSwatch name="surface-primary" />
        <ColorSwatch name="surface-secondary" />
        <ColorSwatch name="surface-nav" />
      </div>

      <SectionTitle>Brand and background</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--gap-md)', marginBottom: 'var(--padding-lg)' }}>
        <ColorSwatch name="background-brand-primary" />
        <ColorSwatch name="background-brand-secondary" />
        <ColorSwatch name="background-primary" />
        <ColorSwatch name="background-secondary" />
      </div>

      <SectionTitle>Text</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--gap-md)', marginBottom: 'var(--padding-lg)' }}>
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
          backgroundColor: 'var(--surface-secondary)',
          padding: 'var(--padding-md)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--padding-lg)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-family-display)', fontSize: 'var(--heading-xl)', marginBottom: 'var(--gap-sm)' }}>
          Display Font
        </p>
        <p style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--heading-lg)', marginBottom: 'var(--gap-sm)' }}>
          Heading Font
        </p>
        <p style={{ fontFamily: 'var(--font-family-body)', fontSize: 'var(--body-md)', marginBottom: 'var(--gap-sm)' }}>
          Body font for paragraphs and content
        </p>
        <p style={{ fontFamily: 'var(--font-family-label)', fontSize: 'var(--label-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Label Font
        </p>
      </div>

      {/* Buttons */}
      <SectionTitle>Buttons</SectionTitle>
      <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexWrap: 'wrap', marginBottom: 'var(--padding-lg)' }}>
        <button
          style={{
            padding: 'var(--gap-md) var(--padding-sm)',
            backgroundColor: 'var(--background-brand-primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-md)',
            fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
            cursor: 'pointer',
          }}
        >
          Primary
        </button>
        <button
          style={{
            padding: 'var(--gap-md) var(--padding-sm)',
            backgroundColor: 'transparent',
            color: 'var(--text-brand-primary)',
            border: 'var(--border-width-lg) solid var(--border-brand-primary)',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-md)',
            fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
            cursor: 'pointer',
          }}
        >
          Secondary
        </button>
        <button
          style={{
            padding: 'var(--gap-md) var(--padding-sm)',
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-primary)',
            border: 'var(--border-width-lg) solid var(--border-secondary)',
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-family-label)',
            fontSize: 'var(--body-md)',
            cursor: 'pointer',
          }}
        >
          Tertiary
        </button>
      </div>

      {/* All Themes Grid */}
      <SectionTitle>All available themes</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--gap-md)' }}>
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
        fontFamily: 'var(--font-family-heading)',
        fontSize: 'var(--heading-lg)',
        marginBottom: 'var(--gap-lg)',
        marginTop: 'var(--padding-lg)',
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
        backgroundColor: 'var(--surface-secondary)',
        padding: 'var(--padding-sm)',
        borderRadius: 'var(--border-radius-md)',
        border: 'var(--border-width-lg) solid var(--border-secondary)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--label-sm)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--gap-xs)',
          fontFamily: 'var(--font-family-label)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--body-lg)',
          fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
          fontFamily: 'var(--font-family-heading)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
      <div
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: isText ? 'var(--surface-primary)' : `var(${varName})`,
          borderRadius: 'var(--border-radius-md)',
          border: 'var(--border-width-lg) solid var(--border-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isText && (
          <span style={{ color: `var(${varName})`, fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, fontSize: 'var(--body-lg)' }}>
            Aa
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 'var(--body-xs)',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-family-label)',
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
        padding: 'var(--gap-lg)',
        borderRadius: 'var(--border-radius-md)',
        border: isActive ? '2px solid var(--border-brand-primary)' : 'var(--border-width-lg) solid var(--border-secondary)',
        backgroundColor: 'var(--surface-secondary)',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <div style={{ fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, marginBottom: 'var(--gap-xs)', fontSize: 'var(--body-md)' }}>
        {themeNum}: {meta.name}
      </div>
      <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-muted)' }}>
        {meta.isDark ? 'Dark' : 'Light'}
      </div>
      {isActive && (
        <div style={{ fontSize: 'var(--body-sm)', color: 'var(--text-brand-primary)', fontWeight: 'var(--font-weight-semi-bold)' as unknown as number, marginTop: 'var(--gap-xs)' }}>
          Active
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ThemeDemo> = {
  title: 'Theming/Theme Switcher',
  component: ThemeDemo,
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

export const Default: Story = {};

export const BrikBrand: Story = {
  globals: { themeNumber: 'brik' },
};

export const BrikDark: Story = {
  globals: { themeNumber: 'brik-dark' },
};

export const ClientSim: Story = {
  globals: { themeNumber: 'client-sim' },
};
