import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={{
        padding: '1.25rem 2rem',
        borderTop: '1px solid var(--sidebar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'transparent',
      }}
    >
      <Shield size={14} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        opacity: 0.7,
        fontWeight: 500,
        letterSpacing: '0.02em',
        textAlign: 'center',
      }}>
        All data presented are for demonstration purposes only. No real pharmaceutical data is used.
      </p>
    </motion.footer>
  );
}
