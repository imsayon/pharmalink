import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color = 'var(--primary)', delay = 0, onClick, prefix = '', borderColor }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const isFloat = String(value).includes('.');
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericValue;
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay * 1000 + 300);

    return () => clearTimeout(timer);
  }, [numericValue, delay]);

  const formattedValue = isFloat
    ? `${prefix}${displayValue.toFixed(2)}`
    : `${prefix}${Math.round(displayValue)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: borderColor ? `4px solid ${borderColor}` : 'none',
        transition: 'background 0.3s ease, border 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          {title}
        </span>
        {Icon && (
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            style={{
              padding: 10,
              background: `${color}15`,
              borderRadius: 'var(--radius-sm)',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} />
          </motion.div>
        )}
      </div>
      <span style={{ fontSize: '2rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>
        {formattedValue}
      </span>
    </motion.div>
  );
}
