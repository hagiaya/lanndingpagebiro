import React from 'react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalNotification = () => {
  const { attendanceMessage } = useData();

  return (
    <AnimatePresence>
      {attendanceMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.5 }}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 9999,
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem 3rem',
            borderRadius: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '300px'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Presensi Pegawai
          </div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 900, textAlign: 'center' }}>{attendanceMessage}</h2>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 10, ease: 'linear' }}
              style={{ height: '100%', background: 'var(--primary)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalNotification;
