import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function Medicines() {
  const [data, setData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { request } = useApi();
  const { showToast } = useToast();

  const load = () => {
    request('/api/medicines').then(setData).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    try {
      const res = await request('/api/medicines/add', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.success) {
        showToast('Medicine added successfully');
        setShowModal(false);
        e.target.reset();
        load();
      } else {
        showToast(res.error || 'Error adding medicine', 'error');
      }
    } catch {
      showToast('Failed to add medicine', 'error');
    }
  };

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 24, height: 24, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', marginRight: 12 }} />
        Loading...
      </div>
    );
  }

  const today = new Date(localStorage.getItem('simDate') || new Date().toISOString().split('T')[0]);

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)',
    background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)',
    fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
          Inventory
        </motion.h1>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Medicine
          </Button>
        </motion.div>
      </div>

      <GlassCard delay={0.1}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Medicine Name', 'Category', 'Stock', 'Price', 'Expiry', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.8rem',
                    color: 'var(--text-muted)', borderBottom: '2px solid rgba(0,0,0,0.05)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.medicines.map((m, i) => {
                const expiry = new Date(m.expiry_date);
                const isExpired = expiry < today;
                let badge;
                if (isExpired) badge = <Badge variant="danger" pulse>Expired</Badge>;
                else if (m.stock_quantity <= 0) badge = <Badge variant="danger">Out of Stock</Badge>;
                else if (m.stock_quantity <= 20) badge = <Badge variant="warning" pulse>Low Stock</Badge>;
                else badge = <Badge variant="success">In Stock</Badge>;

                return (
                  <motion.tr key={m.medicine_id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.03 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13,148,136,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: 600, fontSize: '0.9rem' }}>{m.medicine_name}</td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{m.category}</td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.9rem' }}>{m.stock_quantity} units</td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontWeight: 600, fontSize: '0.9rem' }}>${m.price}</td>
                    <td style={{
                      padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.9rem',
                      color: isExpired ? '#ef4444' : 'var(--text-main)', fontWeight: isExpired ? 700 : 400,
                    }}>{expiry.toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{badge}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Medicine Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Medicine">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>Medicine Name</label>
            <input name="medicine_name" required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>Supplier</label>
            <select name="supplier_id" required style={{ ...inputStyle, background: 'transparent' }}>
              <option value="">-- Select Supplier --</option>
              {(data.suppliers || []).map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={labelStyle}>Category</label>
            <input name="category" required style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input name="stock_quantity" type="number" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price</label>
              <input name="price" type="number" step="0.01" required style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={labelStyle}>Batch No</label>
              <input name="batch_no" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expiry Date</label>
              <input name="expiry_date" type="date" required style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Manufacture Date</label>
            <input name="manufacture_date" type="date" required style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save Medicine</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
