import type { Preview, Decorator } from '@storybook/react';
import type { ThemeNumber } from '../tokens';

// Import the ORIGINAL Webflow CSS directly
import '../updates/brik-bds.webflow/css/brik-bds.webflow.css';
// Import overrides AFTER Webflow CSS to fix Storybook UI conflicts
import './storybook-overrides.css';

/**
 * Theme wrapper component that applies Webflow theme classes
 * Uses a div with both 'body' and 'theme-X' classes to match
 * Webflow's .body.theme-X selector pattern
 */
function ThemeWrapper({
  children,
  themeNumber
}: {
  children: React.ReactNode;
  themeNumber: ThemeNumber;
}) {
  return (
    <div
      className={`body theme-${themeNumber}`}
      style={{
        // Override Webflow's .body border/border-radius for Storybook
        border: 'none',
        borderRadius: 0,
        // Set background/color from theme tokens
        backgroundColor: 'var(--_color---page--primary)',
        color: 'var(--_color---text--primary)',
        // Use spacing token: --_space---lg = 16px
        padding: 'var(--_space---lg)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Theme decorator - wraps all stories in ThemeWrapper
 * and adds toolbar controls for theme switching
 */
const withTheme: Decorator = (Story, context) => {
  const themeNumber = (context.globals.themeNumber || '1') as ThemeNumber;

  return (
    <ThemeWrapper themeNumber={themeNumber}>
      <Story />
    </ThemeWrapper>
  );
};

const preview: Preview = {
  globalTypes: {
    themeNumber: {
      name: 'Theme',
      description: 'BDS theme (bundled color, typography, spacing)',
      defaultValue: '1',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: '1', title: '1: Spacious (Playfair)' },
          { value: '2', title: '2: Yellow-Orange (Dark)' },
          { value: '3', title: '3: Blue-Green (Light)' },
          { value: '4', title: '4: Yellow-Orange (Light)' },
          { value: '5', title: '5: Peach-Brown' },
          { value: '6', title: '6: Pastel (Geist)' },
          { value: '7', title: '7: Yellow-Brown (Lato)' },
          { value: '8', title: '8: Vibrant (Playfair)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Managed by theme
    },
    docs: {
      toc: true,
      source: {
        type: 'code',
        language: 'tsx',
        excludeDecorators: true,
      },
    },
  },
};

export default preview;
