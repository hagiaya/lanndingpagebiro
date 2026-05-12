import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Mail, 
  BarChart3, 
  UserCheck, 
  MessageSquare, 
  Camera,
  Search,
  Bell,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  LogOut,
  LogIn,
  MapPin,
  Bot,
  Network,
  X,
  QrCode
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from './context/DataContext';
import { supabase } from './lib/supabase';

const Dashboard = ({ onOpenAttendance }) => {
  const { 
    customMetrics,
    metrics, 
    officials, 
    activities, 
    mails, 
    photos, 
    orgStructure,
    loading,
    fetchData
  } = useData();

  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  // Real-time listener for attendance
  useEffect(() => {
    const channel = supabase
      .channel('attendance_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, async (payload) => {
        // Fetch employee name for the message
        const { data: emp } = await supabase.from('employees').select('name').eq('id', payload.new.employee_id).single();
        if (emp) {
          const now = new Date();
          const hour = now.getHours();
          const minute = now.getMinutes();
          let lateMsg = '';
          
          // Assuming work starts at 08:00
          if (hour >= 8 && payload.new.type === 'Check-In') {
            const lateMinutes = (hour - 8) * 60 + minute;
            if (lateMinutes > 0) {
              lateMsg = `Anda terlambat ${lateMinutes} menit. `;
            }
          }

          const msg = new SpeechSynthesisUtterance(`Selamat datang ${emp.name}. ${lateMsg}Semangat lagi!`);
          msg.lang = 'id-ID';
          msg.rate = 0.9;
          window.speechSynthesis.speak(msg);
          
          setAttendanceMsg(`Selamat Datang, ${emp.name}!`);
          setTimeout(() => setAttendanceMsg(''), 5000);
          fetchData(); // Refresh to update counts
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Auto slider
  useEffect(() => {
    if (photos && photos.length > 0) {
      const timer = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % photos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [photos]);

  const handleAttendance = () => {
    onOpenAttendance();
  };

  return (
    <div className={`dashboard-container ${loading ? 'loading-state' : ''}`}>
      {/* Header */}
      <header className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>BIRO ORGANISASI</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Dashboard Kinerja & Pelayanan Publik</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={fetchData} 
            className="refresh-btn" 
            title="Refresh Data"
            disabled={loading}
            style={{ width: '36px', height: '36px' }}
          >
            <TrendingUp size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1 }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date().toLocaleTimeString('id-ID')} WIB</p>
          </div>
          <div className="glass-card" style={{ padding: '0.5rem', borderRadius: '0.75rem' }}>
            <Bell size={18} />
          </div>
        </div>
      </header>


      {/* Metrics Row */}
      <div className="metric-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(7, 1fr)`,
        gap: '0.75rem',
        gridColumn: 'span 12'
      }}>
        {/* Core Metrics */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s', padding: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>NILAI IPP</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.ipp}</h2>
            <span style={{ color: 'var(--secondary)', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={12} /> +0.12
            </span>
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s', padding: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>NILAI IKM</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.ikm}</h2>
            <span style={{ color: 'var(--secondary)', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={12} /> +2.5%
            </span>
          </div>
        </div>

        {/* Dynamic Custom Metrics */}
        {Object.entries(customMetrics).map(([category, data], idx) => {
          const latest = data.length > 0 ? data[data.length - 1] : { score: 0, year: '-' };
          return (
            <div key={category} className="glass-card animate-fade-in" style={{ animationDelay: `${0.3 + (idx * 0.1)}s`, padding: '0.75rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>{category.toUpperCase()}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{latest.score}</h2>
              </div>
            </div>
          );
        })}

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.8s', padding: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>PEGAWAI HADIR</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{metrics.hadir}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/{metrics.total}</span>
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.9s', background: 'var(--primary-glow)', padding: '0.5rem' }}>
          <button onClick={() => setIsQrModalOpen(true)} className="attendance-btn" style={{ width: '100%', height: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '0' }}>
            <QrCode size={18} /> ABSENSI HP
          </button>
        </div>
      </div>


      {/* Main Content Area: Left Column (Documentation & Pejabat) & Right Column (Structure & Agenda) */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', minHeight: 0 }}>
        {/* Documentation Slider (Top Left) */}
        <div className="glass-card animate-fade-in" style={{ flex: 1.2, animationDelay: '0.5s', minHeight: '200px' }}>
          <h3 className="section-title"><span></span> Dokumentasi Kegiatan</h3>
          <div className="slider-container" style={{ minHeight: 0 }}>
            <AnimatePresence mode="wait">
              {photos.length > 0 && (
                <motion.div
                  key={currentPhoto}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <img src={photos[currentPhoto].url} alt={photos[currentPhoto].title} className="slider-img" />
                  <div className="slider-caption" style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{photos[currentPhoto].title}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pejabat Status Table (Bottom Left) */}
        <div className="glass-card animate-fade-in" style={{ flex: 1, animationDelay: '0.7s', minHeight: '150px' }}>
          <h3 className="section-title"><span></span> Status Kehadiran Pegawai</h3>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Pejabat</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Jabatan</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {officials.map(person => (
                  <tr key={person.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{person.name}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{person.role}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.65rem', 
                        background: person.status === 'In' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: person.status === 'In' ? 'var(--secondary)' : 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {person.status === 'In' ? <LogIn size={10}/> : <LogOut size={10}/>} {person.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={10} color="var(--text-muted)" /> {person.location}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column (Structure & Agenda) */}
      <div className="sidebar-section" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div className="glass-card animate-fade-in" style={{ flex: 1.5, animationDelay: '0.6s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => setIsOrgOpen(true)}>
          <h3 className="section-title"><span></span> Struktur Organisasi</h3>
          <div className="slider-container" style={{ position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
            {orgStructure ? (
              <>
                <img src={orgStructure} alt="Struktur Organisasi Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                  <Network size={32} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>KLIK UNTUK MEMPERBESAR</span>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Belum ada gambar struktur
              </div>
            )}
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ flex: 1, animationDelay: '0.8s' }}>
          <h3 className="section-title"><span></span> Agenda Kegiatan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
            {activities.map(act => (
              <div key={act.id} style={{ padding: '0.85rem', background: 'var(--bg-accent)', borderRadius: '0.75rem', borderLeft: `4px solid ${act.status === 'Ongoing' ? 'var(--secondary)' : 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.7rem', color: act.status === 'Ongoing' ? 'var(--secondary)' : 'var(--primary)', fontWeight: 700 }}>{act.status.toUpperCase()}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{act.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* AI Bot Bubble & Overlay */}
      <div className="ai-bubble" onClick={() => setIsAiOpen(true)}>
        <Bot color="white" size={32} />
      </div>

      <AnimatePresence>
        {isAiOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card"
            style={{ 
              position: 'fixed', 
              bottom: '6rem', 
              right: '2rem', 
              width: '350px', 
              height: '500px', 
              zIndex: 1001, 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} color="var(--primary)" />
                <h4 style={{ fontWeight: 700 }}>Asisten Biro Organisasi</h4>
              </div>
              <button onClick={() => setIsAiOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Activity size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-accent)', padding: '0.75rem', borderRadius: '0.75rem 0.75rem 0.75rem 0', maxWidth: '80%', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Halo! Saya AI Biro Organisasi. Ada yang bisa saya bantu terkait SAKIP, RB, atau layanan kami?
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Tanya sesuatu..." 
                style={{ flex: 1, background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'white', outline: 'none' }}
              />
              <button style={{ background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', padding: '0 1rem', color: 'white', cursor: 'pointer' }}>
                Kirim
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Mobile Attendance */}
      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh', 
              background: 'rgba(0,0,0,0.85)', 
              backdropFilter: 'blur(10px)',
              zIndex: 3000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setIsQrModalOpen(false)}
          >
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '3rem', background: 'white' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ color: '#1e293b', marginBottom: '1rem', fontWeight: 800 }}>Presensi Pegawai</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>Scan QR Code ini menggunakan HP Anda untuk melakukan absensi kehadiran.</p>
              
              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/attendance')}`} 
                  alt="QR Code Absensi" 
                  style={{ width: '250px', height: '250px' }}
                />
              </div>

              <button 
                onClick={() => setIsQrModalOpen(false)}
                style={{ width: '100%', padding: '1rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '1rem', fontWeight: 700, cursor: 'pointer' }}
              >
                TUTUP
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Structure Modal */}
      <AnimatePresence>
        {isOrgOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh', 
              background: 'rgba(0,0,0,0.9)', 
              zIndex: 3000, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setIsOrgOpen(false)}
          >
            <button 
              onClick={() => setIsOrgOpen(false)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3001 }}
            >
              <X color="black" size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={orgStructure} 
              alt="Struktur Organisasi Full" 
              style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: '1rem', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Overlay */}
      <AnimatePresence>
        {attendanceMsg && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{ 
              position: 'fixed', 
              bottom: '2rem', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 2000,
              background: 'var(--secondary)',
              color: 'white',
              padding: '1.5rem 3rem',
              borderRadius: '2rem',
              fontWeight: 700,
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
              textAlign: 'center',
              fontSize: '1.25rem'
            }}
          >
            {attendanceMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
