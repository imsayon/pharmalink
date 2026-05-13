import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Footer from './components/Layout/Footer';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const pages = {
  dashboard: Dashboard,
  medicines: Medicines,
  suppliers: Suppliers,
  customers: Customers,
  billing: Billing,
  reports: Reports,
  settings: Settings,
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = pages[activePage] || Dashboard;

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onNavigate={setActivePage} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <PageComponent />
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
