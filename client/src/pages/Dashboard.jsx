import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import StatsCard from '../components/ui/StatsCard';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const { request } = useApi();

  useEffect(() => {
    request('/api/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 24, height: 24, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', marginRight: 12 }}
        />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}
      >
        Dashboard
      </motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatsCard title="Total Medicines" value={data.totalMedicines} icon={Package} color="var(--primary)" delay={0} />
        <StatsCard title="Total Sales" value={Number(data.totalSales)} icon={DollarSign} color="#10b981" delay={0.1} prefix="₹" />
        <StatsCard title="Low Stock Alerts" value={data.lowStockCount || 0} icon={AlertTriangle} color="#f59e0b" delay={0.2} />
        <StatsCard title="Expiring Soon" value={data.expiringCount || 0} icon={Clock} color="#ef4444" delay={0.3} />
      </div>

      <GlassCard delay={0.4}>
        <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.05rem' }}>Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Bill ID', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem',
                    color: 'var(--text-muted)', borderBottom: '2px solid rgba(0,0,0,0.05)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.recentBills || []).map((b, i) => (
                <motion.tr
                  key={b.bill_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  style={{ transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13,148,136,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    #{b.bill_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {b.customer_name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(b.bill_date).toLocaleDateString('en-IN').replace(/\//g, '-')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    ₹{b.total_amount}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <Badge variant="success">Paid</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {(!data.recentBills || data.recentBills.length === 0) && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No recent transactions found.
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
