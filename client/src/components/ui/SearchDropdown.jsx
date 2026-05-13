import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ArrowRight } from 'lucide-react';

export default function SearchDropdown({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch medicines for search index
  useEffect(() => {
    fetch('/api/medicines')
      .then(r => r.json())
      .then(d => setAllMedicines(d.medicines || []))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const term = val.toLowerCase();
      const matches = allMedicines
        .filter(m =>
          m.medicine_name.toLowerCase().includes(term) ||
          m.category?.toLowerCase().includes(term)
        )
        .slice(0, 6);

      setResults(matches);
      setIsOpen(matches.length > 0);
    }, 200);
  };

  const handleSelect = (medicine) => {
    setIsOpen(false);
    setQuery('');
    if (onNavigate) onNavigate('medicines');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(0,0,0,0.04)',
          padding: '0.7rem 1.25rem',
          borderRadius: '50px',
          border: '1px solid var(--border-color)',
          transition: 'all 0.2s ease',
        }}
      >
        <Search size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search medicines, categories..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && results.length && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            width: '100%',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            color: 'var(--text-main)',
          }}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: 'var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            {results.map((med, i) => (
              <motion.div
                key={med.medicine_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(med)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13,148,136,0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(13,148,136,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    flexShrink: 0,
                  }}
                >
                  <Package size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {med.medicine_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {med.category} · {med.stock_quantity} units · ${med.price}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
