import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Phone, Trash2, Plus } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function Suppliers() {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, id: null });
  const { request } = useApi();
  const { showToast } = useToast();

  const load = () => request('/api/suppliers').then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await request('/api/suppliers/add', { method: 'POST', body: JSON.stringify(body) });
      if (res.success) { showToast('Supplier added'); setShowModal(false); e.target.reset(); load(); }
      else showToast(res.error, 'error');
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      const res = await request(`/api/suppliers/${confirmState.id}`, { method: 'DELETE' });
      if (res.success) { showToast('Deleted'); load(); }
      else showToast(res.error || 'Cannot delete', 'error');
    } catch { showToast('Error', 'error'); }
    setConfirmState({ open: false, id: null });
  };

  if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const iStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' };
  const lStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Suppliers</motion.h1>
        <Button onClick={() => setShowModal(true)}><Plus size={18} /> Add Supplier</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {data.suppliers.map((s, i) => (
          <motion.div key={s.supplier_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
            style={{ background: 'var(--bg-card)', backdropFilter: 'var(--glass-blur)', border: 'var(--glass-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <motion.div whileHover={{ rotate: 15 }} style={{ background: 'rgba(13,148,136,0.1)', padding: '0.85rem', borderRadius: '50%', color: 'var(--primary)' }}><Truck size={22} /></motion.div>
              <div><h3 style={{ margin: 0, fontWeight: 700 }}>{s.supplier_name}</h3><Badge variant="info">Active</Badge></div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Phone size={13} /> {s.phone}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> {s.address || 'N/A'}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setConfirmState({ open: true, id: s.supplier_id })}
                style={{ border: 'none', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 500 }}>
                <Trash2 size={14} /> Delete
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Supplier">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>Supplier Name</label><input name="supplier_name" required style={iStyle} /></div>
          <div style={{ marginBottom: '0.85rem' }}><label style={lStyle}>Phone</label><input name="phone" required style={iStyle} /></div>
          <div style={{ marginBottom: '1.25rem' }}><label style={lStyle}>Address</label><input name="address" required style={iStyle} /></div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save Supplier</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={confirmState.open} message="Delete this supplier? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirmState({ open: false, id: null })} />
    </div>
  );
}
