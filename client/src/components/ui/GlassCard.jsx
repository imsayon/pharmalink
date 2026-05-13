import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0, style = {}, onClick }) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -4, boxShadow: 'var(--shadow-lg)' } : {}}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: '1.5rem',
        transition: 'background 0.3s ease, border 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
