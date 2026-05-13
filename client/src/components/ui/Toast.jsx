import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: 'var(--glass-border)',
              color: 'var(--text-main)',
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              borderLeft: `4px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontWeight: 500,
              fontSize: '0.9rem',
              pointerEvents: 'auto',
              cursor: 'pointer',
              maxWidth: 360,
            }}
            onClick={() => onRemove(toast.id)}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            ) : (
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
            )}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
