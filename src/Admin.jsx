import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Mail, 
  Settings, 
  Camera, 
  BarChart, 
  Plus, 
  Trash2, 
  Save, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useData } from './context/DataContext';

const AdminPanel = () => {
  const { 
    sakipData, setSakipData,
    rbData, setRbData,
    metrics, setMetrics,
    officials, setOfficials,
    activities, setActivities,
    mails, setMails,
    photos, setPhotos,
    berakhlakData, setBerakhlakData
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');

  const updateMetric = (key, value) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const deleteOfficial = (id) => {
    setOfficials(prev => prev.filter(o => o.id !== id));
  };

  const addOfficial = () => {
    const newOfficial = {
      id: Date.now(),
      name: 'Nama Pejabat Baru',
      role: 'Jabatan',
      status: 'In',
      location: 'Kantor',
      time: '08:00'
    };
    setOfficials(prev => [...prev, newOfficial]);
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        padding: '1rem', 
        borderRadius: '0.75rem', 
        cursor: 'pointer',
        background: activeTab === id ? 'var(--primary)' : 'transparent',
        color: activeTab === id ? 'white' : 'var(--text-muted)',
        transition: 'all 0.2s ease',
        marginBottom: '0.5rem'
      }}
    >
      <Icon size={20} />
      <span style={{ fontWeight: 600 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      {/* Admin Sidebar */}
      <div style={{ width: '280px', background: 'var(--bg-card)', borderRight: '1px solid var(--glass-border)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings color="white" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>ADMIN PANEL</h2>
        </div>

        <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
        <SidebarItem id="kinerja" icon={TrendingUp} label="Data Kinerja" />
        <SidebarItem id="pejabat" icon={Users} label="Manajemen Pejabat" />
        <SidebarItem id="kegiatan" icon={Calendar} label="Agenda Kegiatan" />
        <SidebarItem id="surat" icon={Mail} label="Surat Masuk" />
        <SidebarItem id="dokumentasi" icon={Camera} label="Dokumentasi" />

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              background: 'rgba(244, 63, 94, 0.1)', 
              color: 'var(--accent)', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600 
            }}
          >
            <LogOut size={20} /> Lihat Dashboard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'kinerja' && 'Manajemen Data Kinerja'}
              {activeTab === 'pejabat' && 'Status Kehadiran Pejabat'}
              {activeTab === 'kegiatan' && 'Manajemen Agenda'}
              {activeTab === 'surat' && 'Input Surat Masuk'}
              {activeTab === 'dokumentasi' && 'Update Dokumentasi'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola data yang tampil di layar publik</p>
          </div>
          <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
            <span>Admin Surat</span>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3>Quick Stats</h3>
              <p>Total Surat: {mails.length}</p>
              <p>Kegiatan Aktif: {activities.length}</p>
              <p>Pejabat Terdaftar: {officials.length}</p>
            </div>
            {/* More stats... */}
          </div>
        )}

        {activeTab === 'kinerja' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Skor Metrik Utama</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nilai IPP</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={metrics.ipp} 
                    onChange={(e) => updateMetric('ipp', parseFloat(e.target.value))}
                    style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nilai IKM</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metrics.ikm} 
                    onChange={(e) => updateMetric('ikm', parseFloat(e.target.value))}
                    style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }}
                  />
                </div>
              </div>
            </section>

            <section className="glass-card">
              <h3 className="section-title"><span></span> Data SAKIP (3 Tahun)</h3>
              {sakipData.map((data, index) => (
                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <span style={{ width: '60px' }}>{data.year}</span>
                  <input 
                    type="number" 
                    value={data.score} 
                    onChange={(e) => {
                      const newData = [...sakipData];
                      newData[index].score = parseFloat(e.target.value);
                      setSakipData(newData);
                    }}
                    style={{ flex: 1, background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }}
                  />
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'pejabat' && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}><span></span> Daftar Pejabat</h3>
              <button onClick={addOfficial} className="attendance-btn" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={18} /> Tambah Pejabat
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nama</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Keterangan</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {officials.map(person => (
                    <tr key={person.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          value={person.name} 
                          onChange={(e) => {
                            setOfficials(officials.map(o => o.id === person.id ? { ...o, name: e.target.value } : o));
                          }}
                          style={{ background: 'none', border: 'none', color: 'white', fontWeight: 600, width: '100%' }}
                        />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person.role}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          value={person.status} 
                          onChange={(e) => {
                            setOfficials(officials.map(o => o.id === person.id ? { ...o, status: e.target.value } : o));
                          }}
                          style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.25rem', borderRadius: '0.5rem' }}
                        >
                          <option value="In">Hadir (In)</option>
                          <option value="Out">Keluar (Out)</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          value={person.location} 
                          onChange={(e) => {
                            setOfficials(officials.map(o => o.id === person.id ? { ...o, location: e.target.value } : o));
                          }}
                          placeholder="Lokasi..."
                          style={{ background: 'var(--bg-accent)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => deleteOfficial(person.id)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'surat' && (
          <div className="glass-card">
            <h3 className="section-title"><span></span> Input Surat Masuk Baru</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                placeholder="Subjek Surat..." 
                className="glass-card" 
                style={{ background: 'var(--bg-accent)', width: '100%' }}
              />
              <input 
                placeholder="Asal Surat..." 
                className="glass-card" 
                style={{ background: 'var(--bg-accent)', width: '100%' }}
              />
              <button className="attendance-btn" style={{ justifyContent: 'center' }}>
                <Plus size={20} /> Simpan Surat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
