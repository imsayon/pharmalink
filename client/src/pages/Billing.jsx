import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, XCircle, CreditCard } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

export default function Billing() {
  const [data, setData] = useState(null);
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { request } = useApi();
  const { showToast } = useToast();

  const load = () => request('/api/billing').then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const addToCart = (med) => {
    if (med.stock_quantity <= 0) return showToast('Out of stock!', 'error');
    setCart(prev => {
      const existing = prev.find(i => i.medicine_id === med.medicine_id);
      if (existing) {
        if (existing.quantity >= med.stock_quantity) { showToast('Max stock reached', 'error'); return prev; }
        return prev.map(i => i.medicine_id === med.medicine_id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * parseFloat(med.price) } : i);
      }
      return [...prev, { medicine_id: med.medicine_id, medicine_name: med.medicine_name, price: parseFloat(med.price), quantity: 1, subtotal: parseFloat(med.price) }];
    });
  };

  const removeFromCart = (medId) => setCart(prev => prev.filter(i => i.medicine_id !== medId));
  const total = cart.reduce((s, i) => s + i.subtotal, 0);

  const processPayment = async () => {
    if (cart.length === 0) return showToast('Cart is empty!', 'error');
    const custEl = document.getElementById('billing-customer');
    if (!custEl?.value) return showToast('Select a customer!', 'error');
    setProcessing(true);
    try {
      const res = await request('/api/billing/create', {
        method: 'POST',
        body: JSON.stringify({ customer_id: custEl.value, items: cart, total_amount: total, payment_method: 'Cash' }),
      });
      if (res.success) { showToast('Payment processed! Bill #' + res.bill_id); setCart([]); load(); }
      else showToast(res.error, 'error');
    } catch { showToast('Payment failed', 'error'); }
    setProcessing(false);
  };

  if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const thStyle = { textAlign: 'left', padding: '0.75rem 0.85rem', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-muted)', borderBottom: '2px solid rgba(0,0,0,0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdStyle = { padding: '0.75rem 0.85rem', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: '0.88rem' };
  const selStyle = { width: '100%', padding: '0.7rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Billing & POS</motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Medicines */}
        <GlassCard delay={0.1}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem' }}>Available Medicines</h3>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Medicine', 'Stock', 'Price', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
              <tbody>
                {data.medicines.map((m, i) => (
                  <motion.tr key={m.medicine_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,148,136,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{m.medicine_name}</td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{m.stock_quantity}</td>
                    <td style={tdStyle}>${m.price}</td>
                    <td style={tdStyle}>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                        onClick={() => addToCart(m)}
                        style={{ padding: '4px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                        Add
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Right: Cart */}
        <GlassCard delay={0.2}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem' }}>Current Order</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Customer</label>
            <select id="billing-customer" style={selStyle}>
              <option value="">-- Select Customer --</option>
              {data.customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.phone})</option>)}
            </select>
          </div>

          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '2px dashed rgba(0,0,0,0.08)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', gap: 8 }}>
              <ShoppingCart size={28} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '0.9rem' }}>No items added yet</span>
            </motion.div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Item', 'Qty', 'Sub', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {cart.map(item => (
                      <motion.tr key={item.medicine_id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <td style={{ ...tdStyle, fontWeight: 500 }}>{item.medicine_name}</td>
                        <td style={tdStyle}>{item.quantity}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                        <td style={tdStyle}>
                          <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => removeFromCart(item.medicine_id)}
                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><XCircle size={16} /></motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)' }}>
            <span>Total:</span>
            <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</motion.span>
          </div>

          <Button onClick={processPayment} disabled={processing}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', background: '#10b981', color: 'white', borderRadius: 'var(--radius-md)' }}>
            <CreditCard size={18} /> {processing ? 'Processing...' : 'Process Payment'}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
