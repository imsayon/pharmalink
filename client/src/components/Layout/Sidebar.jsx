import { motion } from 'framer-motion';
import { LayoutGrid, Package, Truck, Users, FileText, BarChart2, Settings, LogOut } from 'lucide-react';
import logo from '../../assets/logo.svg';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'medicines', label: 'Medicines', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'reports', label: 'Analytics', icon: BarChart2 },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside
      style={{
        width: 270,
        minWidth: 270,
        height: '100vh',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: '1.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <motion.img
          src={logo}
          alt="PharmaLink"
          style={{ width: 38, height: 38 }}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        <h1
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          PharmaLink
        </h1>
      </motion.div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map((item, i) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.8rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.2s ease, color 0.2s ease',
                boxShadow: isActive ? '0 4px 14px rgba(13, 148, 136, 0.35)' : 'none',
                textAlign: 'left',
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--sidebar-border)' }}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0.8rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.2s ease, color 0.2s ease',
                boxShadow: isActive ? '0 4px 14px rgba(13, 148, 136, 0.35)' : 'none',
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
        <motion.a
          href="/api/auth/logout"
          whileHover={{ x: 4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontWeight: 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'none',
            marginTop: 2,
          }}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </motion.a>
      </div>
    </aside>
  );
}
