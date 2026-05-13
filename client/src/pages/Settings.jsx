import { motion } from 'framer-motion';
import { Moon, Sun, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const currentSimDate = localStorage.getItem('simDate') || new Date().toISOString().split('T')[0];

  const handleDateChange = (e) => {
    localStorage.setItem('simDate', e.target.value);
    showToast('Simulation date updated');
  };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Settings
      </motion.h1>

      <div style={{ maxWidth: 560 }}>
        <GlassCard delay={0.1}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Appearance</h3>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isDark ? <Moon size={20} style={{ color: 'var(--primary)' }} /> : <Sun size={20} style={{ color: '#f59e0b' }} />}
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Dark Mode</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>Toggle dark theme</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: isDark ? 'var(--primary)' : 'rgba(0,0,0,0.15)',
                position: 'relative', transition: 'background 0.3s ease',
              }}
            >
              <motion.div
                animate={{ x: isDark ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </motion.button>
          </div>
        </GlassCard>

        <div style={{ marginTop: '1.25rem' }}>
          <GlassCard delay={0.2}>
            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>Simulation</h3>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Date Override</h4>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>Simulate dates for expiry logic</p>
                </div>
              </div>
              <input
                type="date"
                defaultValue={currentSimDate}
                onChange={handleDateChange}
                style={{
                  padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)',
                  background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)',
                  fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none',
                }}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
