import { motion } from 'framer-motion';

const variants = {
  primary: {
    background: 'var(--primary)',
    color: 'white',
    hoverBg: 'var(--primary-hover)',
  },
  secondary: {
    background: 'rgba(0,0,0,0.06)',
    color: 'var(--text-main)',
    hoverBg: 'rgba(0,0,0,0.1)',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    hoverBg: 'rgba(239, 68, 68, 0.2)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    hoverBg: 'rgba(0,0,0,0.04)',
  },
};

export default function Button({ children, variant = 'primary', onClick, style = {}, disabled = false, type = 'button' }) {
  const v = variants[variant] || variants.primary;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        fontFamily: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: v.background,
        color: v.color,
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => !disabled && (e.target.style.background = v.hoverBg)}
      onMouseLeave={(e) => !disabled && (e.target.style.background = v.background)}
    >
      {children}
    </motion.button>
  );
}
