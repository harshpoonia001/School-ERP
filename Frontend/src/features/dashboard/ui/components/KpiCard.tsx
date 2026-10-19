import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trendColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trendColor = 'var(--primary-laurel)',
}) => {
  return (
    <div
      className="neu-card"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--slate)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontSize: '1.85rem',
            marginTop: '0.35rem',
            marginBottom: '0.2rem',
            fontWeight: 800,
            color: 'var(--charcoal)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-light)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        className="neu-inset-sm"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: trendColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
};
