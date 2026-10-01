import type { CSSProperties, ReactNode } from 'react';

const titleStyle: CSSProperties = {
  fontFamily: 'var(--bds-font-family-heading)',
  fontSize: 'var(--bds-heading-xl)',
  fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
  color: 'var(--bds-text-primary)',
  margin: 0,
  lineHeight: 1.2,
};

const subtitleStyle: CSSProperties = {
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-md)',
  color: 'var(--bds-text-secondary)',
  margin: 'var(--bds-gap-xs) 0 0',
  lineHeight: 1.6,
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--bds-font-family-heading)',
  fontSize: 'var(--bds-heading-md)',
  fontWeight: 'var(--bds-font-weight-semibold)' as unknown as number,
  color: 'var(--bds-text-primary)',
  margin: '0 0 var(--bds-gap-md)',
  lineHeight: 1.3,
};

const sectionDescStyle: CSSProperties = {
  fontFamily: 'var(--bds-font-family-body)',
  fontSize: 'var(--bds-body-sm)',
  color: 'var(--bds-text-muted)',
  margin: '0 0 var(--bds-gap-md)',
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
        padding: 'var(--bds-padding-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--bds-gap-xl)',
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
