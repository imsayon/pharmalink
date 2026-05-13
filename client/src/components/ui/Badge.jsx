const badgeStyles = {
  success: { background: '#d1fae5', color: '#065f46' },
  warning: { background: '#fef3c7', color: '#92400e' },
  danger:  { background: '#fee2e2', color: '#991b1b' },
  info:    { background: '#ccfbf1', color: '#0f766e' },
};

export default function Badge({ variant = 'info', children, pulse = false }) {
  const style = badgeStyles[variant] || badgeStyles.info;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.25rem 0.75rem',
        borderRadius: '50px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {pulse && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: style.color,
            animation: 'pulse 2s infinite',
          }}
        />
      )}
      {children}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }`}</style>
    </span>
  );
}
