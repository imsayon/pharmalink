import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, Clock, TrendingDown, BarChart2, PieChart } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../context/ThemeContext';
import StatsCard from '../components/ui/StatsCard';
import GlassCard from '../components/ui/GlassCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Reports() {
  const [data, setData] = useState(null);
  const { request } = useApi();
  const { isDark } = useTheme();

  useEffect(() => {
    const simDate = localStorage.getItem('simDate') || '';
    request(`/api/reports${simDate ? '?simDate=' + simDate : ''}`).then(setData).catch(() => {});
  }, []);

  if (!data) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const barData = {
    labels: (data.sales_dates || []).map(d => new Date(d).toLocaleDateString('en-IN').replace(/\//g, '-')),
    datasets: [{
      label: 'Revenue (₹)',
      data: data.sales_totals || [],
      backgroundColor: '#0d9488',
      borderRadius: 8,
      barThickness: 28,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
      x: { grid: { display: false }, ticks: { color: textColor } },
    },
  };

  const doughnutData = {
    labels: data.med_names || [],
    datasets: [{
      data: data.med_sold || [],
      backgroundColor: ['#0d9488', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor, padding: 16, font: { family: 'Inter', size: 12 } } },
    },
  };

  return (
    <div>
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Analytics Dashboard</motion.h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatsCard title="Expired Items" value={(data.expired || []).length} icon={AlertOctagon} color="#ef4444" delay={0} borderColor="#ef4444" />
        <StatsCard title="Expiring Soon" value={(data.expiring_soon || []).length} icon={Clock} color="#f59e0b" delay={0.1} borderColor="#f59e0b" />
        <StatsCard title="Low Stock" value={(data.low_stock || []).length} icon={TrendingDown} color="#3b82f6" delay={0.2} borderColor="#3b82f6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard delay={0.3}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Revenue Trend (Last 7 Days)
          </h3>
          {(data.sales_dates || []).length > 0 ? (
            <Bar data={barData} options={barOptions} height={120} />
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No sales data available</p>
          )}
        </GlassCard>

        <GlassCard delay={0.4} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <PieChart size={18} style={{ color: '#10b981' }} /> Top Selling
          </h3>
          {(data.med_names || []).length > 0 ? (
            <div style={{ width: '100%', maxWidth: 230 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data available</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
