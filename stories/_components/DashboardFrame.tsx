import type { CSSProperties, ReactNode } from 'react';

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-xl)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
  margin: 0,
  lineHeight: 1.2,
};

const subtitleStyle: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-md)',
  color: 'var(--text-secondary)',
  margin: 'var(--gap-xs) 0 0',
  lineHeight: 1.6,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--heading-md)',
  fontWeight: 'var(--font-weight-semi-bold)' as unknown as number,
  color: 'var(--text-primary)',
  margin: '0 0 var(--gap-md)',
  lineHeight: 1.3,
};

const sectionDescStyle: CSSProperties = {
  fontFamily: 'var(--font-family-body)',
  fontSize: 'var(--body-sm)',
  color: 'var(--text-muted)',
  margin: '0 0 var(--gap-md)',
  lineHeight: 1.5,
};

export function DashboardFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        padding: 'var(--padding-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-xl)',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <header>
        <h1 style={titleStyle}>{title}</h1>
        {subtitle ? <div style={subtitleStyle}>{subtitle}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {description ? <p style={sectionDescStyle}>{description}</p> : null}
      {children}
    </section>
  );
}
