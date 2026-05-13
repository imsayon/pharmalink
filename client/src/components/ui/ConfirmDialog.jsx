import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message = 'Are you sure you want to delete this item?' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: 'var(--glass-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1, damping: 15 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <AlertTriangle size={28} style={{ color: '#ef4444' }} />
            </motion.div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Confirm Action
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button variant="danger" onClick={onConfirm} style={{ background: '#ef4444', color: 'white' }}>Delete</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
