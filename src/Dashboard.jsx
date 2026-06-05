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
  QrCode,
  BookOpen,
  Send,
  ClipboardList
} from 'lucide-react';
import { supabase } from './lib/supabase';
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

const OrgNode = ({ node, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', position: 'relative' }}>
    <div className="glass-card" style={{ 
      padding: '0.75rem 1.25rem', 
      minWidth: '180px', 
      textAlign: 'center', 
      border: '1px solid var(--primary)', 
      background: 'rgba(99, 102, 241, 0.1)',
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)',
      zIndex: 2
    }}>
      <h4 style={{ margin: 0, fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>{node.name}</h4>
      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{node.role}</p>
    </div>
    {children && React.Children.count(children) > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '2px', height: '24px', background: 'var(--primary)' }}></div>
        <div style={{ display: 'flex', gap: '2rem', position: 'relative', paddingTop: '24px', justifyContent: 'center' }}>
          {/* Horizontal line for children */}
          {React.Children.count(children) > 1 && (
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 'calc(100% / ' + (React.Children.count(children) * 2) + ')', 
              right: 'calc(100% / ' + (React.Children.count(children) * 2) + ')',
              height: '2px', 
              background: 'var(--primary)',
              zIndex: 1
            }}></div>
          )}
          {/* Connecting vertical lines for each child if multiple */}
          {React.Children.map(children, (child, idx) => (
            <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               {React.Children.count(children) > 1 && (
                 <div style={{ position: 'absolute', top: '-24px', width: '2px', height: '24px', background: 'var(--primary)' }}></div>
               )}
               {child}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Dashboard = ({ onOpenAttendance }) => {
  const { 
    customMetrics,
    metrics, 
    officials, 
    activities, 
    mails, 
    photos, 
    orgStructure,
    attendanceMessage,
    loading,
    fetchData,
    updateAttendance
  } = useData();

  const hadirCount = officials.filter(emp => emp.status === 'In' || emp.status === 'Kantor').length;
  const totalCount = officials.length;

  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [guestData, setGuestData] = useState({ name: '', origin: '', purpose: '', employeeId: '' });
  const [aiInput, setAiInput] = useState('');

  // Auto-refresh website every 2 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      window.location.reload();
    }, 2 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestData.name || !guestData.origin || !guestData.employeeId) return;

    const emp = officials.find(o => o.id === guestData.employeeId);
    if (emp) {
      const voiceMsg = `Selamat datang Bapak atau Ibu ${guestData.name} dari ${guestData.origin}. Mohon tunggu sebentar, Bapak atau Ibu ${emp.name} akan segera menemui Anda.`;
      try {
        const utterance = new SpeechSynthesisUtterance(voiceMsg);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Local speech error:', e);
      }
      setIsGuestModalOpen(false);
      setGuestData({ name: '', origin: '', purpose: '', employeeId: '' });
    }
  };

  const handleManualAttendance = async (emp) => {
    setProcessingId(emp.id);
    try {
      const res = await updateAttendance(emp.id, 'In', 'Kantor Biro Organisasi', '');
      if (res.success) {
        setIsQrModalOpen(false);
        setProcessingId(null);
        
        // Immediate local voice feedback
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const isLate = hour > 7 || (hour === 7 && minute > 30);
        let lateMinutes = 0;
        if (isLate) {
          lateMinutes = (hour * 60 + minute) - (7 * 60 + 30);
        }
        
        const voiceMsg = isLate 
          ? `Selamat datang ${emp.name}. Anda terlambat ${lateMinutes} menit, ayo lebih semangat lagi!` 
          : `Selamat datang ${emp.name}. Terima kasih sudah datang tepat waktu!`;
        
        try {
          const utterance = new SpeechSynthesisUtterance(voiceMsg);
          utterance.lang = 'id-ID';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Local speech error:', e);
        }
      } else {
        alert('Gagal mencatat absensi.');
        setProcessingId(null);
      }
    } catch (err) {
      console.error('Manual attendance error:', err);
      setProcessingId(null);
    }
  };

  const renderOrgTree = (parentId) => {
    if (!Array.isArray(orgStructure)) return null;
    return orgStructure
      .filter(node => node.parentId === (parentId || ''))
      .map(node => (
        <OrgNode key={node.id} node={node}>
          {renderOrgTree(node.id)}
        </OrgNode>
      ));
  };

  // Auto-close QR modal when a new attendance is detected globally
  useEffect(() => {
    if (attendanceMessage) {
      setIsQrModalOpen(false);
    }
  }, [attendanceMessage]);

  useEffect(() => {
    if (photos && photos.length > 0) {
      const timer = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % photos.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [photos]);

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
          <button onClick={fetchData} className="refresh-btn" title="Refresh Data" disabled={loading} style={{ width: '36px', height: '36px' }}>
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
        gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
        gap: '0.75rem',
        gridColumn: 'span 12'
      }}>
        {/* Unified metric rendering to prevent double data */}
        {Object.entries(customMetrics)
          .sort(([a], [b]) => {
            const priority = ['IPP', 'IKM', 'SAKIP', 'RB'];
            const idxA = priority.indexOf(a.toUpperCase());
            const idxB = priority.indexOf(b.toUpperCase());
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
          })
          .map(([cat, data], idx) => {
            // Sort data by year ascending so that the latest year (highest year number) is always the last element
            const sortedData = [...(data || [])].sort((a, b) => parseInt(a.year) - parseInt(b.year));
            const latest = sortedData.length > 0 ? sortedData[sortedData.length - 1] : { score: 0, year: '-' };
            const prev = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
            
            let trend = 0;
            let isUp = true;
            if (prev && prev.score !== 0) {
              trend = ((latest.score - prev.score) / prev.score) * 100;
              isUp = trend >= 0;
            }

            return (
              <div key={cat} className="glass-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s`, padding: '0.75rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{cat}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{latest.score}</h2>
                  {prev && (
                    <span style={{ 
                      color: isUp ? 'var(--secondary)' : 'var(--accent)', 
                      fontSize: '0.65rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 700 
                    }}>
                      {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {Math.abs(trend).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s', padding: '0.75rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>PEGAWAI HADIR</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{hadirCount}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/{totalCount}</span>
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.5s', display: 'flex', gap: '0.5rem', background: 'transparent', padding: 0 }}>
          <button 
            onClick={() => {
              const u = new SpeechSynthesisUtterance("Tes suara berhasil. Sistem siap.");
              u.lang = 'id-ID';
              window.speechSynthesis.speak(u);
            }} 
            className="glass-card" 
            style={{ padding: '0.5rem', flex: 1, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'white', fontSize: '0.7rem', fontWeight: 600 }}
          >
            <Activity size={14} /> TES SUARA
          </button>
          <button onClick={() => setIsQrModalOpen(true)} className="attendance-btn" style={{ flex: 2, justifyContent: 'center', fontSize: '0.8rem', padding: '0' }}>
            <QrCode size={16} /> ABSENSI
          </button>
        </div>
      </div>

      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', minHeight: 0 }}>
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

        <div className="glass-card animate-fade-in" style={{ flex: 1, animationDelay: '0.7s', minHeight: '150px' }}>
          <h3 className="section-title"><span></span> Status Kehadiran Pegawai</h3>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Pejabat</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Jabatan</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)' }}>Keterlambatan</th>
                </tr>
              </thead>
              <tbody>
                {officials.map(person => {
                  let lateText = '-';
                  if (person.status === 'In' || person.status === 'Kantor') {
                    if (person.last_seen) {
                      const checkInDate = new Date(person.last_seen);
                      const hour = checkInDate.getHours();
                      const minute = checkInDate.getMinutes();
                      const lateMinutes = (hour * 60 + minute) - (7 * 60 + 30);
                      
                      if (lateMinutes > 0) {
                        const h = Math.floor(lateMinutes / 60);
                        const m = lateMinutes % 60;
                        lateText = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
                      } else {
                        lateText = 'Tepat Waktu';
                      }
                    }
                  }

                  return (
                  <tr key={person.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{person.name}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{person.role}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.65rem', 
                        background: (person.status === 'In' || person.status === 'Kantor') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: (person.status === 'In' || person.status === 'Kantor') ? 'var(--secondary)' : 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {(person.status === 'In' || person.status === 'Kantor') ? <LogIn size={10}/> : <LogOut size={10}/>} {(person.status === 'In' || person.status === 'Kantor') ? 'Hadir' : 'Belum Hadir'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: lateText === 'Tepat Waktu' ? 'var(--secondary)' : (lateText !== '-' ? 'var(--accent)' : 'var(--text-muted)') }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: lateText !== '-' && lateText !== 'Tepat Waktu' ? 700 : 400 }}>
                        <Activity size={10} /> {lateText}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="sidebar-section" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div className="glass-card animate-fade-in" style={{ flex: 1.5, animationDelay: '0.6s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => setIsOrgOpen(true)}>
          <h3 className="section-title"><span></span> Struktur Organisasi</h3>
          <div className="slider-container" style={{ position: 'relative', background: 'var(--bg-accent)' }}>
            {Array.isArray(orgStructure) && orgStructure.length > 0 ? (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'var(--primary-glow)' }}>
                <Network size={40} color="var(--primary)" className="animate-pulse" />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white', display: 'block' }}>{orgStructure.length} UNIT KERJA</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>KLIK UNTUK LIHAT DETAIL</span>
                </div>
              </div>
            ) : orgStructure && typeof orgStructure === 'string' && orgStructure.startsWith('http') ? (
              <>
                <img src={orgStructure} alt="Struktur Organisasi Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)' }}>
                  <Network size={32} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'white' }}>LIHAT STRUKTUR</span>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                BELUM ADA DATA STRUKTUR
              </div>
            )}
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ flex: 1, animationDelay: '0.8s' }}>
          <h3 className="section-title"><span></span> Agenda Kegiatan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '180px' }}>
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

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.9s', cursor: 'pointer', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }} onClick={() => setIsGuestModalOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'white' }}>Buku Tamu Instansi</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klik untuk mengisi daftar hadir tamu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-bubble" onClick={() => setIsAiOpen(true)}>
        <Bot color="white" size={32} />
      </div>

      <AnimatePresence>
        {isAiOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="glass-card" style={{ position: 'fixed', bottom: '6rem', right: '2rem', width: '350px', height: '500px', zIndex: 1001, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={20} color="var(--primary)" />
                <h4 style={{ fontWeight: 700 }}>Asisten Biro Organisasi</h4>
              </div>
              <button onClick={() => setIsAiOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-accent)', padding: '0.75rem', borderRadius: '0.75rem 0.75rem 0.75rem 0', maxWidth: '80%', marginBottom: '1rem', fontSize: '0.875rem' }}>Halo! Saya AI Biro Organisasi. Ada yang bisa saya bantu terkait SAKIP, RB, atau layanan kami?</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(aiInput) { alert('Fitur AI sedang dalam pengembangan.'); setAiInput(''); } }} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Ketik pertanyaan..." 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', borderRadius: '2rem', color: 'white', fontSize: '0.875rem' }} 
              />
              <button type="submit" style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={16} color="white" style={{ marginLeft: '-2px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQrModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsQrModalOpen(false)}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', background: 'white', padding: '2rem', borderRadius: '2rem' }} onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#1e293b', margin: 0, fontWeight: 800 }}>Presensi Manual</h2>
                  <button onClick={() => setIsQrModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} /></button>
               </div>
               
               <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                 <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Pilih nama Anda untuk melakukan Check-In Masuk:</p>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {officials.filter(emp => emp.status !== 'In' && emp.status !== 'Kantor').length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Semua pegawai telah melakukan presensi hari ini.
                      </div>
                    )}
                    {officials.filter(emp => emp.status !== 'In' && emp.status !== 'Kantor').map(emp => (
                     <button 
                       key={emp.id} 
                       onClick={() => handleManualAttendance(emp)}
                       disabled={processingId !== null}
                       style={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '1rem', 
                         padding: '1rem', 
                         background: processingId === emp.id ? '#e0e7ff' : '#f8fafc', 
                         border: processingId === emp.id ? '2px solid var(--primary)' : '1px solid #e2e8f0', 
                         borderRadius: '1rem',
                         cursor: processingId !== null ? 'not-allowed' : 'pointer',
                         width: '100%',
                         textAlign: 'left',
                         opacity: processingId !== null && processingId !== emp.id ? 0.5 : 1,
                         transition: 'all 0.2s ease'
                       }}
                     >
                       <div style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                         {processingId === emp.id ? <Activity size={20} className="spinner" /> : <UserCheck size={20} />}
                       </div>
                       <div>
                         <div style={{ fontWeight: 700, color: '#1e293b' }}>{emp.name}</div>
                         <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                           {processingId === emp.id ? 'Memproses kehadiran...' : emp.role}
                         </div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrgOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsOrgOpen(false)}>
            <div className="modal-content" style={{ maxWidth: '95vw', maxHeight: '90vh', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: '3rem', overflow: 'auto', borderRadius: '1.5rem' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsOrgOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3001, color: 'white' }}><X size={24} /></button>
              <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '3rem', textAlign: 'center' }}><span></span> Struktur Organisasi Biro Organisasi</h2>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 'fit-content', padding: '1rem' }}>
                {Array.isArray(orgStructure) && orgStructure.length > 0 ? renderOrgTree(null) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    {typeof orgStructure === 'string' && orgStructure.startsWith('http') ? (
                      <img src={orgStructure} alt="Struktur Organisasi" style={{ maxWidth: '100%', borderRadius: '1rem' }} />
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>Belum ada data struktur organisasi.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGuestModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setIsGuestModalOpen(false)}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', background: 'white', padding: '2.5rem', borderRadius: '2rem' }} onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ClipboardList size={20} color="var(--primary)" />
                    </div>
                    <h2 style={{ color: '#1e293b', margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Buku Tamu</h2>
                  </div>
                  <button onClick={() => setIsGuestModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
               </div>
               
               <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nama Lengkap</label>
                   <input required type="text" value={guestData.name} onChange={e => setGuestData({...guestData, name: e.target.value})} placeholder="Masukkan nama Anda..." style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#0f172a' }} />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Asal OPD / Instansi / K/L</label>
                   <input required type="text" value={guestData.origin} onChange={e => setGuestData({...guestData, origin: e.target.value})} placeholder="Contoh: Dinas Kesehatan Provinsi..." style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#0f172a' }} />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tujuan Kedatangan</label>
                   <input required type="text" value={guestData.purpose} onChange={e => setGuestData({...guestData, purpose: e.target.value})} placeholder="Contoh: Konsultasi SAKIP..." style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#0f172a' }} />
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Pilih Pegawai yang Dituju</label>
                   <select required value={guestData.employeeId} onChange={e => setGuestData({...guestData, employeeId: e.target.value})} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: '#0f172a' }}>
                     <option value="">-- Pilih Pegawai --</option>
                     {officials.map(emp => (
                       <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                     ))}
                   </select>
                 </div>
                 
                 <button type="submit" style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                   Kirim Daftar Hadir
                 </button>
               </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
