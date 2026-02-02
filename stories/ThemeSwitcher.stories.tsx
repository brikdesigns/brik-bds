import type { Meta, StoryObj } from '@storybook/react';
import { themeMetadata, ThemeNumber } from '../tokens';

/**
 * ThemeSwitcher Demo
 *
 * Demonstrates the BDS theme system. Use toolbar to switch between 8 themes.
 * Each theme bundles color palette, typography, and spacing.
 *
 * CSS Variables use Webflow naming: --_color---[category]--[variant]
 */

function ThemeDemo() {
  // Get current theme from URL or default
  const urlParams = new URLSearchParams(window.location.search);
  const globalsParam = urlParams.get('globals');
  let currentTheme: ThemeNumber = '1';
  if (globalsParam) {
    const match = globalsParam.match(/themeNumber:(\d)/);
    if (match) currentTheme = match[1] as ThemeNumber;
  }

  const meta = themeMetadata[currentTheme] || themeMetadata['1'];

  return (
    <div
      style={{
        padding: 'var(--_space---lg, 24px)',
        fontFamily: 'var(--_typography---font-family--body, sans-serif)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--_typography---font-family--heading, sans-serif)',
          fontSize: 'var(--_typography---heading--xx-large, 2.5rem)',
          marginBottom: 'var(--_space---md, 16px)',
        }}
      >
        BDS Theme Switcher
      </h1>

      <p
        style={{
          fontSize: 'var(--_typography---body--lg, 1.125rem)',
          color: 'var(--_color---text--secondary)',
          marginBottom: 'var(--_space---lg, 24px)',
        }}
      >
        Use the toolbar controls above to switch themes.
      </p>

      {/* Current Theme Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--_space---gap--md, 16px)',
          marginBottom: 'var(--_space---xl, 48px)',
        }}
      >
        <ThemeCard label="Theme Number" value={currentTheme} />
        <ThemeCard label="Theme Name" value={meta.name} />
        <ThemeCard label="Mode" value={meta.isDark ? 'Dark' : 'Light'} />
      </div>

      <p
        style={{
          color: 'var(--_color---text--muted)',
          marginBottom: 'var(--_space---xl)',
          fontStyle: 'italic',
        }}
      >
        {meta.description}
      </p>

      {/* Color Swatches */}
      <SectionTitle>Page & Surface Colors</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '32px' }}>
        <ColorSwatch name="page--primary" />
        <ColorSwatch name="page--secondary" />
        <ColorSwatch name="surface--primary" />
        <ColorSwatch name="surface--secondary" />
        <ColorSwatch name="surface--nav" />
      </div>

      <SectionTitle>Brand & Background Colors</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '32px' }}>
        <ColorSwatch name="background--brand-primary" />
        <ColorSwatch name="background--brand-secondary" />
        <ColorSwatch name="background--primary" />
        <ColorSwatch name="background--secondary" />
      </div>

      <SectionTitle>Text Colors</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '32px' }}>
        <ColorSwatch name="text--primary" isText />
        <ColorSwatch name="text--secondary" isText />
        <ColorSwatch name="text--muted" isText />
        <ColorSwatch name="text--brand" isText />
        <ColorSwatch name="text--inverse" isText />
      </div>

      <SectionTitle>Theme Accent Colors</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '32px' }}>
        <ColorSwatch name="theme--primary" />
        <ColorSwatch name="theme--secondary" />
        <ColorSwatch name="theme--tertiary" />
        <ColorSwatch name="theme--accent" />
      </div>

      {/* Typography Demo */}
      <SectionTitle>Typography</SectionTitle>
      <div
        style={{
          backgroundColor: 'var(--_color---surface--secondary)',
          padding: 'var(--_space---md)',
          borderRadius: '8px',
          marginBottom: '32px',
        }}
      >
        <p style={{ fontFamily: 'var(--_typography---font-family--display)', fontSize: '2rem', marginBottom: '8px' }}>
          Display Font
        </p>
        <p style={{ fontFamily: 'var(--_typography---font-family--heading)', fontSize: '1.5rem', marginBottom: '8px' }}>
          Heading Font
        </p>
        <p style={{ fontFamily: 'var(--_typography---font-family--body)', fontSize: '1rem', marginBottom: '8px' }}>
          Body font for paragraphs and content
        </p>
        <p style={{ fontFamily: 'var(--_typography---font-family--label)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Label Font
        </p>
      </div>

      {/* Buttons */}
      <SectionTitle>Buttons</SectionTitle>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <button
          style={{
            padding: '8px 24px',
            backgroundColor: 'var(--_color---background--brand-primary)',
            color: 'var(--_color---text--inverse)',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Primary
        </button>
        <button
          style={{
            padding: '8px 24px',
            backgroundColor: 'transparent',
            color: 'var(--_color---text--brand)',
            border: '2px solid var(--_color---border--brand)',
            borderRadius: '4px',
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Secondary
        </button>
        <button
          style={{
            padding: '8px 24px',
            backgroundColor: 'var(--_color---surface--secondary)',
            color: 'var(--_color---text--primary)',
            border: '1px solid var(--_color---border--secondary)',
            borderRadius: '4px',
            fontFamily: 'var(--_typography---font-family--label)',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Tertiary
        </button>
      </div>

      {/* All Themes Grid */}
      <SectionTitle>All Available Themes</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {(['1', '2', '3', '4', '5', '6', '7', '8'] as ThemeNumber[]).map((num) => (
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
        fontFamily: 'var(--_typography---font-family--heading)',
        fontSize: 'var(--_typography---heading--large, 1.5rem)',
        marginBottom: '16px',
        marginTop: '24px',
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
        backgroundColor: 'var(--_color---surface--secondary)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--_color---border--secondary)',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--_color---text--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px',
          fontFamily: 'var(--_typography---font-family--label)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          fontFamily: 'var(--_typography---font-family--heading)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ColorSwatch({ name, isText }: { name: string; isText?: boolean }) {
  const varName = `--_color---${name}`;
  const displayName = name.replace(/--/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div
        style={{
          width: '100%',
          height: '48px',
          backgroundColor: isText ? 'var(--_color---surface--primary)' : `var(${varName})`,
          borderRadius: '4px',
          border: '1px solid var(--_color---border--secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isText && (
          <span style={{ color: `var(${varName})`, fontWeight: 600, fontSize: '1.25rem' }}>
            Aa
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--_color---text--muted)',
          fontFamily: 'var(--_typography---font-family--label)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </span>
    </div>
  );
}

function ThemePreview({ themeNum, isActive }: { themeNum: ThemeNumber; isActive: boolean }) {
  const meta = themeMetadata[themeNum];

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '8px',
        border: isActive ? '2px solid var(--_color---border--brand)' : '1px solid var(--_color---border--secondary)',
        backgroundColor: 'var(--_color---surface--secondary)',
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>
        {themeNum}: {meta.name}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--_color---text--muted)' }}>
        {meta.isDark ? '🌙 Dark' : '☀️ Light'}
      </div>
      {isActive && (
        <div style={{ fontSize: '0.75rem', color: 'var(--_color---text--brand)', fontWeight: 600, marginTop: '4px' }}>
          ✓ Active
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ThemeDemo> = {
  title: 'Theme/ThemeSwitcher',
  component: ThemeDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# BDS Theme System

8 bundled themes with color, typography, and spacing.

| # | Name | Font | Mode |
|---|------|------|------|
| 1 | Spacious | Playfair Display | Light |
| 2 | Yellow-Orange | Default | Dark |
| 3 | Blue-Green | Default | Light |
| 4 | Yellow-Orange | Default | Light |
| 5 | Peach-Brown | Default | Light |
| 6 | Pastel | Geist | Light |
| 7 | Yellow-Brown | Lato | Light |
| 8 | Vibrant | Playfair Display | Light |

## Variable Naming

\`\`\`css
--_color---page--primary
--_color---text--brand
--_typography---font-family--heading
--_space---lg
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThemeDemo>;

export const Default: Story = {};

export const DarkTheme: Story = {
  globals: { themeNumber: '2' },
};

export const PeachBrown: Story = {
  globals: { themeNumber: '5' },
};

export const Pastel: Story = {
  globals: { themeNumber: '6' },
};

export const YellowBrown: Story = {
  globals: { themeNumber: '7' },
};

export const Vibrant: Story = {
  globals: { themeNumber: '8' },
};
