import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Mail, 
  Settings, 
  Camera, 
  Plus, 
  Trash2, 
  Save, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Award,
  ShieldCheck,
  RefreshCcw,
  Network
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useData } from './context/DataContext';
import { TOTP, Secret } from 'otpauth';

const AdminPanel = () => {
  const { 
    customMetrics,
    metrics, setMetrics,
    officials, setOfficials,
    activities,
    mails,
    photos,
    updateMetrics,
    updateChartData,
    deleteCategory,
    addEmployee,
    deleteEmployee,
    addActivity,
    deleteActivity,
    addMail,
    deleteMail,
    addPhoto,
    deletePhoto,
    orgStructure,
    updateOrgStructure
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  
  // New Item States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', status: 'Out', last_location: '-' });
  const [newActivity, setNewActivity] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '08:00' });
  const [newMail, setNewMail] = useState({ subject: '', from: '', date_received: new Date().toISOString().split('T')[0] });
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '' });
  const [tempOrgUrl, setTempOrgUrl] = useState(orgStructure || '');

  const handleAddEmployee = async () => {
    if (!newEmployee.name) return;
    setSaving(true);
    const res = await addEmployee(newEmployee);
    setSaving(false);
    if (res.success) {
      setNewEmployee({ name: '', role: '', status: 'Out', last_location: '-' });
      alert('Pegawai berhasil ditambahkan!');
    } else {
      alert('Gagal menambah pegawai: ' + (res.error?.message || 'Unknown error'));
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.title) return;
    setSaving(true);
    
    // Check if we should combine date and time into one 'date' field
    // or if the schema only accepts 'date'. 
    // We'll try to send a combined string to the 'date' column.
    const activityToSave = {
      title: newActivity.title,
      date: `${newActivity.date} ${newActivity.time}`,
      status: 'Upcoming' // Default status if column exists
    };
    
    const res = await addActivity(activityToSave);
    setSaving(false);
    if (res.success) {
      setNewActivity({ title: '', date: new Date().toISOString().split('T')[0], time: '08:00' });
      alert('Agenda berhasil ditambahkan!');
    } else {
      // If it still fails because of the combined date, try sending only the date part
      console.error('Failed with combined date, trying date only:', res.error);
      setSaving(true);
      const resRetry = await addActivity({
        title: newActivity.title,
        date: newActivity.date,
        status: 'Upcoming'
      });
      setSaving(false);
      if (resRetry.success) {
        setNewActivity({ title: '', date: new Date().toISOString().split('T')[0], time: '08:00' });
        alert('Agenda berhasil ditambahkan (tanpa info jam)!');
      } else {
        alert('Gagal menambah agenda: ' + (resRetry.error?.message || 'Unknown error'));
      }
    }
  };

  const handleAddMail = async () => {
    if (!newMail.subject) return;
    setSaving(true);
    const res = await addMail(newMail);
    setSaving(false);
    if (res.success) {
      setNewMail({ subject: '', from: '', date_received: new Date().toISOString().split('T')[0] });
      alert('Surat berhasil ditambahkan!');
    } else {
      alert('Gagal menambah surat: ' + (res.error?.message || 'Unknown error'));
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhoto.url) return;
    setSaving(true);
    const res = await addPhoto(newPhoto);
    setSaving(false);
    if (res.success) {
      setNewPhoto({ url: '', title: '' });
      alert('Dokumentasi berhasil ditambahkan!');
    } else {
      alert('Gagal menambah dokumentasi: ' + (res.error?.message || 'Unknown error'));
    }
  };

  const handleUpdateOrg = async () => {
    setSaving(true);
    await updateOrgStructure(tempOrgUrl);
    setSaving(false);
    alert('Struktur Organisasi berhasil diperbarui!');
  };
  const handleSaveMetrics = async () => {
    setSaving(true);
    await updateMetrics(metrics);
    setSaving(false);
    alert('Data berhasil disimpan!');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    const initialData = [{ year: new Date().getFullYear().toString(), score: 0 }];
    await updateChartData(newCategoryName, initialData);
    setNewCategoryName('');
  };

  const handleUpdateCategoryData = (category, index, field, value) => {
    const categoryData = customMetrics[category] || [];
    let newData = [...categoryData];
    
    if (index === -1) {
      // If no data exists, create the first entry
      newData = [{ 
        year: new Date().getFullYear().toString(), 
        score: field === 'score' ? value : 0,
        [field]: value 
      }];
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }
    
    updateChartData(category, newData);
  };

  const handleAddYear = (category) => {
    const categoryData = customMetrics[category] || [];
    const lastYear = categoryData.length > 0 
      ? parseInt(categoryData[categoryData.length - 1].year) 
      : new Date().getFullYear();
    const newData = [...categoryData, { year: (lastYear + 1).toString(), score: 0 }];
    updateChartData(category, newData);
  };

  const generateSecret = (officialId) => {
    const secret = new Secret().base32;
    setOfficials(prev => prev.map(o => o.id === officialId ? { ...o, totp_secret: secret } : o));
    alert(`Secret baru dibuat: ${secret}. Silakan masukkan ke Google Authenticator.`);
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
        <SidebarItem id="struktur" icon={Network} label="Struktur Organisasi" />

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
      <div style={{ flex: 1, height: '100vh', padding: '2.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'kinerja' && 'Manajemen Data Kinerja'}
              {activeTab === 'pejabat' && 'Status Kehadiran Pejabat'}
              {activeTab === 'kegiatan' && 'Manajemen Agenda'}
              {activeTab === 'surat' && 'Input Surat Masuk'}
              {activeTab === 'dokumentasi' && 'Update Dokumentasi'}
              {activeTab === 'struktur' && 'Struktur Organisasi'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Kelola data yang tampil di layar publik</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['kinerja', 'pejabat'].includes(activeTab) && (
              <button 
                onClick={handleSaveMetrics} 
                disabled={saving}
                className="attendance-btn" 
                style={{ padding: '0.75rem 1.5rem', background: 'var(--secondary)' }}
              >
                <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </button>
            )}
            <div className="glass-card" style={{ padding: '0.75rem 1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
              <span>Super Admin</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3>Statistik Sistem</h3>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Pejabat</span> <strong>{officials.length}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Agenda Aktif</span> <strong>{activities.length}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Surat Masuk</span> <strong>{mails.length}</strong></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kinerja' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
            {/* Quick Edit Metrics */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>NILAI IPP</label>
                <input type="number" step="0.01" value={metrics.ipp} onChange={(e) => setMetrics({ ...metrics, ipp: parseFloat(e.target.value) || 0 })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }} />
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>NILAI IKM</label>
                <input type="number" step="0.1" value={metrics.ikm} onChange={(e) => setMetrics({ ...metrics, ikm: parseFloat(e.target.value) || 0 })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }} />
              </div>
              {/* Also show SAKIP & RB if they exist in customMetrics for quick edit */}
              {['SAKIP', 'RB'].map(cat => {
                const data = customMetrics[cat] || [];
                const latest = data.length > 0 ? data[data.length - 1] : { score: 0, year: new Date().getFullYear().toString() };
                return (
                  <div key={cat} className="glass-card" style={{ padding: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>SKOR {cat} ({latest.year})</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={latest.score} 
                      onChange={(e) => handleUpdateCategoryData(cat, data.length > 0 ? data.length - 1 : -1, 'score', parseFloat(e.target.value) || 0)} 
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white', fontSize: '1.25rem', fontWeight: 700 }} 
                    />
                  </div>
                );
              })}
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
              {/* Chart Section */}
              <section className="glass-card">
                <h3 className="section-title"><span></span> Survey Budaya Kerja</h3>
                <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={customMetrics['Budker'] || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                      <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} />
                      <YAxis stroke="var(--text-muted)" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="score" name="Skor" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Add Category Section */}
              <section className="glass-card">
                <h3 className="section-title"><span></span> Tambah Kategori Baru</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Tambahkan metrik kinerja tahunan lainnya.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input placeholder="Nama Metrik (SAKIP, RB, dll)" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} />
                  <button onClick={handleAddCategory} className="attendance-btn" style={{ width: '100%' }}>Tambah Kategori</button>
                </div>
              </section>
            </div>

            {/* Detailed Category Management */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              {Object.keys(customMetrics).map(category => (
                <section key={category} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}><span></span> Data {category}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleAddYear(category)} className="refresh-btn" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>+ Tahun</button>
                      <button onClick={() => deleteCategory(category)} className="refresh-btn" style={{ color: 'var(--accent)' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {customMetrics[category].map((data, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input type="text" value={data.year} onChange={(e) => handleUpdateCategoryData(category, index, 'year', e.target.value)} style={{ width: '80px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.6rem', borderRadius: '0.5rem', color: 'white', textAlign: 'center' }} />
                        <input type="number" step="0.1" value={data.score} onChange={(e) => handleUpdateCategoryData(category, index, 'score', parseFloat(e.target.value) || 0)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.6rem', borderRadius: '0.5rem', color: 'white' }} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pejabat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Tambah Pejabat</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <input placeholder="Nama Lengkap" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input placeholder="Jabatan" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <button onClick={handleAddEmployee} disabled={saving} className="attendance-btn">
                  {saving ? '...' : 'Tambah'}
                </button>
              </div>
            </section>
            <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', background: '#1e293b' }}>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Pejabat</th>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Secret</th>
                      <th style={{ padding: '1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officials.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                          <strong>{o.name}</strong><br/><small>{o.role}</small>
                        </td>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                          <code>{o.totp_secret || '-'}</code>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => generateSecret(o.id)} className="refresh-btn" style={{ display: 'inline-flex', marginRight: '0.5rem' }}><RefreshCcw size={14} /></button>
                          <button onClick={() => deleteEmployee(o.id)} className="refresh-btn" style={{ display: 'inline-flex', color: 'var(--accent)' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'kegiatan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Tambah Agenda</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <input placeholder="Nama Kegiatan" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input type="date" value={newActivity.date} onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input type="time" value={newActivity.time} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <button onClick={handleAddActivity} disabled={saving} className="attendance-btn">
                  {saving ? '...' : 'Tambah'}
                </button>
              </div>
            </section>
            <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', background: '#1e293b' }}>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Nama Kegiatan</th>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Waktu</th>
                      <th style={{ padding: '1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}><strong>{a.title}</strong></td>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                          <small>
                            {a.date ? new Date(a.date).toLocaleDateString('id-ID') : '-'}
                            {a.time ? ` • ${a.time}` : (a.date && a.date.includes(' ') ? ` • ${a.date.split(' ')[1]}` : '')}
                          </small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => deleteActivity(a.id)} className="refresh-btn" style={{ color: 'var(--accent)' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'surat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Input Surat Masuk</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <input placeholder="Perihal Surat" value={newMail.subject} onChange={(e) => setNewMail({ ...newMail, subject: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input placeholder="Dari" value={newMail.from} onChange={(e) => setNewMail({ ...newMail, from: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input type="date" value={newMail.date_received} onChange={(e) => setNewMail({ ...newMail, date_received: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <button onClick={handleAddMail} disabled={saving} className="attendance-btn">
                  {saving ? '...' : 'Tambah'}
                </button>
              </div>
            </section>
            <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', background: '#1e293b' }}>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Perihal</th>
                      <th style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>Dari / Tanggal</th>
                      <th style={{ padding: '1rem' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mails.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}><strong>{m.subject}</strong></td>
                        <td style={{ padding: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}><small>{m.from} • {m.date_received}</small></td>
                        <td style={{ padding: '1rem' }}>
                          <button onClick={() => deleteMail(m.id)} className="refresh-btn" style={{ color: 'var(--accent)' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'dokumentasi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Tambah Foto Kegiatan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <input placeholder="URL Foto" value={newPhoto.url} onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <input placeholder="Judul/Keterangan" value={newPhoto.title} onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })} style={{ background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                <button onClick={handleAddPhoto} disabled={saving} className="attendance-btn">
                  {saving ? '...' : 'Tambah'}
                </button>
              </div>
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {photos.map(p => (
                <div key={p.id} className="glass-card" style={{ padding: '0.5rem', position: 'relative' }}>
                  <img src={p.url} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{p.title}</p>
                  <button onClick={() => deletePhoto(p.id)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(244, 63, 94, 0.8)', border: 'none', color: 'white', padding: '0.25rem', borderRadius: '0.25rem', cursor: 'pointer' }}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'struktur' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Update Gambar Struktur Organisasi</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Masukkan URL gambar struktur organisasi yang akan ditampilkan di dashboard publik.</p>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <input 
                  placeholder="https://example.com/struktur.jpg" 
                  value={tempOrgUrl} 
                  onChange={(e) => setTempOrgUrl(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} 
                />
                <button 
                  onClick={handleUpdateOrg} 
                  disabled={saving}
                  className="attendance-btn" 
                  style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}
                >
                  <Save size={20} /> {saving ? 'Menyimpan...' : 'Perbarui Struktur'}
                </button>
              </div>
            </section>
            
            {orgStructure && (
              <section className="glass-card">
                <h3 className="section-title"><span></span> Preview Saat Ini</h3>
                <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                  <img src={orgStructure} alt="Struktur Organisasi" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </section>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

