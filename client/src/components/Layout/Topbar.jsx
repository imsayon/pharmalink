import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import SearchDropdown from '../ui/SearchDropdown';

export default function Topbar({ onNavigate }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        height: 72,
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--sidebar-border)',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <SearchDropdown onNavigate={onNavigate} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Admin User</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</div>
        </div>
        <motion.div
          whileHover={{ scale: 1.08 }}
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 2px 8px rgba(13,148,136,0.3)',
          }}
        >
          <User size={18} />
        </motion.div>
      </div>
    </motion.header>
  );
}
