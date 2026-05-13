import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, History } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Customers() {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [historyModal, setHistoryModal] = useState({ open: false, history: [] });
  const [confirmState, setConfirmState] = useState({ open: false, id: null });
  const { request } = useApi();
  const { showToast } = useToast();

  const load = () => request('/api/customers').then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await request('/api/customers/add', { method: 'POST', body: JSON.stringify(body) });
      if (res.success) { showToast('Customer added'); setShowModal(false); e.target.reset(); load(); }
      else showToast(res.error, 'error');
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      const res = await request(`/api/customers/${confirmState.id}`, { method: 'DELETE' });
      if (res.success) { showToast('Deleted'); load(); }
      else showToast(res.error || 'Cannot delete', 'error');
    } catch { showToast('Error', 'error'); }
    setConfirmState({ open: false, id: null });
  };

  const viewHistory = async (id) => {
    try {
      const res = await request(`/api/customers/${id}/history`);
      if (res.success) setHistoryModal({ open: true, history: res.history });
      else showToast(res.error, 'error');
    } catch { showToast('Error fetching history', 'error'); }
  };

  if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const iStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' };
  const lStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 };
  const thStyle = { textAlign: 'left', padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '2px solid rgba(0,0,0,0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdStyle = { padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.9rem' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Customers</motion.h1>
        <Button onClick={() => setShowModal(true)}><Plus size={18} /> Add Customer</Button>
      </div>

      <GlassCard delay={0.1}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Name', 'Phone', 'Age', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {data.customers.map((c, i) => (
                <motion.tr key={c.customer_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,148,136,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{c.customer_name}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{c.phone}</td>
                  <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{c.age || 'N/A'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => viewHistory(c.customer_id)}
                        style={{ padding: '4px 12px', fontSize: '0.82rem', background: 'rgba(13,148,136,0.1)', color: 'var(--primary)', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <History size={13} /> History
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setConfirmState({ open: true, id: c.customer_id })}
                        style={{ padding: '4px 12px', fontSize: '0.82rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={13} /> Delete
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Customer">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>Customer Name</label><input name="customer_name" required style={iStyle} /></div>
          <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>Phone</label><input name="phone" required style={iStyle} /></div>
          <div style={{ marginBottom: '1.25rem' }}><label style={lStyle}>Age</label><input name="age" type="number" required style={iStyle} /></div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={historyModal.open} onClose={() => setHistoryModal({ open: false, history: [] })} title="Purchase History" maxWidth="600px">
        {historyModal.history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No purchase history found.</p>
        ) : (
          <div style={{ maxHeight: 350, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Bill ID', 'Date', 'Total'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {historyModal.history.map(h => (
                  <tr key={h.bill_id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>#{h.bill_id}</td>
                    <td style={tdStyle}>{new Date(h.bill_date).toLocaleDateString()} {new Date(h.bill_date).toLocaleTimeString()}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--primary)' }}>${h.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={confirmState.open} message="Delete this customer? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirmState({ open: false, id: null })} />
    </div>
  );
}
