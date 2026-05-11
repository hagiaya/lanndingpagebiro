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
  Bot
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

const Dashboard = () => {
  const { 
    sakipData, 
    rbData, 
    metrics, 
    officials, 
    activities, 
    mails, 
    photos, 
    berakhlakData 
  } = useData();

  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  // Auto slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhoto((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const handleAttendance = () => {
    const names = ['Heri', 'Andi', 'Siska', 'Budi'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const hoursLate = Math.floor(Math.random() * 3) + 1;
    const msg = `Selamat datang ${randomName}, anda terlambat ${hoursLate} jam lebih. Waduh mohon lebih semangat lagi agar bisa datang tepat waktu, Ganbate!`;
    
    setAttendanceMsg(msg);
    
    // Voice synthesis
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);

    setTimeout(() => setAttendanceMsg(''), 6000);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="glass-card" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity color="white" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>BIRO ORGANISASI</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dashboard Kinerja & Pelayanan Publik</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 600 }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Senin, 09:15 WIB</p>
          </div>
          <div className="glass-card" style={{ padding: '0.75rem', borderRadius: '1rem' }}>
            <Bell size={20} />
          </div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="metric-grid">
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>NILAI IPP</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{metrics.ipp}</h2>
            <span style={{ color: 'var(--secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} /> +0.12
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indeks Pelayanan Publik (Skala 5.0)</p>
        </div>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>NILAI IKM</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{metrics.ikm}</h2>
            <span style={{ color: 'var(--secondary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={16} /> +2.5%
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indeks Kepuasan Masyarakat</p>
        </div>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>PEGAWAI HADIR</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{metrics.hadir}</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/ {metrics.total}</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{metrics.total - metrics.hadir} Pegawai sedang Dinas Luar</p>
        </div>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.4s', background: 'var(--primary-glow)' }}>
          <button onClick={handleAttendance} className="attendance-btn" style={{ width: '100%', height: '100%', justifyContent: 'center', fontSize: '1.1rem' }}>
            <UserCheck size={24} /> ABSENSI (SCAN)
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-section glass-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3 className="section-title"><span></span> Tren Kinerja Strategis (SAKIP & RB)</h3>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sakipData}>
              <defs>
                <linearGradient id="colorSakip" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-main)' }}
              />
              <Area type="monotone" dataKey="score" name="SAKIP" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSakip)" />
              <Area type="monotone" data={rbData} dataKey="score" name="RB" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRB)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Photo Slider Section */}
      <div className="sidebar-section glass-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3 className="section-title"><span></span> Dokumentasi Kegiatan</h3>
        <div className="slider-container">
          <AnimatePresence mode="wait">
            {photos.length > 0 && (
              <motion.div
                key={currentPhoto}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', height: '100%' }}
              >
                <img src={photos[currentPhoto].url} alt={photos[currentPhoto].title} className="slider-img" />
                <div className="slider-caption">
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{photos[currentPhoto].title}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
          {photos.map((_, i) => (
            <div 
              key={i} 
              style={{ 
                width: i === currentPhoto ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: i === currentPhoto ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>
      </div>

      {/* Official Status Section */}
      <div className="chart-section glass-card animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <h3 className="section-title"><span></span> Status Kehadiran Pejabat</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Pejabat</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Jabatan</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {officials.map(person => (
                <tr key={person.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{person.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{person.role}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      background: person.status === 'In' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                      color: person.status === 'In' ? 'var(--secondary)' : 'var(--accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {person.status === 'In' ? <LogIn size={14}/> : <LogOut size={14}/>} {person.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} color="var(--text-muted)" /> {person.location}
                    </div>
                    {person.return && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Kembali: {person.return}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activities & Mail Section */}
      <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <h3 className="section-title"><span></span> Agenda Kegiatan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map(act => (
              <div key={act.id} style={{ padding: '1rem', background: 'var(--bg-accent)', borderRadius: '1rem', borderLeft: `4px solid ${act.status === 'Ongoing' ? 'var(--secondary)' : 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: act.status === 'Ongoing' ? 'var(--secondary)' : 'var(--primary)', fontWeight: 700 }}>{act.status.toUpperCase()}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
                <p style={{ fontWeight: 600 }}>{act.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <h3 className="section-title"><span></span> Surat Masuk Terbaru</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mails.map(mail => (
              <div key={mail.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ background: 'var(--bg-accent)', p: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                  <Mail size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mail.subject}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dari: {mail.from} • {mail.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BerAKHLAK Chart */}
      <div className="glass-card animate-fade-in" style={{ gridColumn: 'span 12', animationDelay: '1.0s' }}>
        <h3 className="section-title"><span></span> Survey Budaya Kerja BerAKHLAK</h3>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={berakhlakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="score" name="Skor BerAKHLAK" fill="var(--primary)" radius={[8, 8, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
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
