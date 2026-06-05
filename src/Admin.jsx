import React, { useState, useEffect } from 'react';
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
  Network,
  Clock
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
    deleteChartDataRow,
    addEmployee,
    deleteEmployee,
    addActivity,
    deleteActivity,
    addMail,
    deleteMail,
    addPhoto,
    deletePhoto,
    orgStructure,
    updateOrgStructure,
    attendanceHistory
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [saving, setSaving] = useState(false);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '4dm!n123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      setLoginError('');
    } else {
      setLoginError('Password salah!');
    }
  };
  
  // Local state to hold temporary edits for custom metrics to avoid keystroke delay and numeric bugs
  const [localCustomMetrics, setLocalCustomMetrics] = useState({});

  useEffect(() => {
    if (customMetrics && Object.keys(customMetrics).length > 0) {
      setLocalCustomMetrics(prev => {
        // Only initialize from context customMetrics if local state is empty/unpopulated
        if (!prev || Object.keys(prev).length === 0) {
          return JSON.parse(JSON.stringify(customMetrics));
        }
        return prev;
      });
    }
  }, [customMetrics]);
  
  // New Item States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', status: 'Out', last_location: '-' });
  const [newActivity, setNewActivity] = useState({ title: '', date: new Date().toISOString().split('T')[0], time: '08:00' });
  const [newMail, setNewMail] = useState({ subject: '', from: '', date_received: new Date().toISOString().split('T')[0] });
  const [newPhoto, setNewPhoto] = useState({ url: '', title: '' });
  const [newOrgNode, setNewOrgNode] = useState({ name: '', role: '', parentId: '' });
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
    // If it's the old string URL, we keep it as is, but we want the new JSON structure
    await updateOrgStructure(orgStructure); 
    setSaving(false);
    alert('Struktur Organisasi berhasil diperbarui!');
  };

  const handleAddOrgNode = async () => {
    if (!newOrgNode.name || !newOrgNode.role) return;
    const newNode = { ...newOrgNode, id: Date.now().toString() };
    const updatedStructure = Array.isArray(orgStructure) ? [...orgStructure, newNode] : [newNode];
    const res = await updateOrgStructure(updatedStructure);
    if (!res.success) {
      alert('Gagal menambah unit: ' + (res.error?.message || 'Unknown error'));
    }
    setNewOrgNode({ name: '', role: '', parentId: '' });
  };

  const deleteOrgNode = async (id) => {
    if (!Array.isArray(orgStructure)) return;
    const updatedStructure = orgStructure.filter(n => n.id !== id);
    const res = await updateOrgStructure(updatedStructure);
    if (!res.success) {
      alert('Gagal menghapus unit: ' + (res.error?.message || 'Unknown error'));
    }
  };
  const handleSaveMetrics = async () => {
    setSaving(true);
    // 1. Update general metrics
    const resMetrics = await updateMetrics(metrics);
    
    // 2. Update custom metrics (SAKIP, RB, Budker, etc.) from local state
    let allSuccess = true;
    let errorMessage = '';
    const updatedLocalMetrics = {};
    
    for (const [category, data] of Object.entries(localCustomMetrics)) {
      // Convert scores from string (or whatever format) back to clean float numbers for database
      const parsedData = data.map(d => ({
        ...d,
        score: typeof d.score === 'string'
          ? (parseFloat(d.score.replace(',', '.')) || 0)
          : (parseFloat(d.score) || 0),
        year: d.year ? d.year.toString() : new Date().getFullYear().toString()
      }));
      
      updatedLocalMetrics[category] = parsedData;
      
      const res = await updateChartData(category, parsedData);
      if (!res.success) {
        allSuccess = false;
        errorMessage = res.error?.message || 'Gagal menyimpan metrik ' + category;
      }
    }
    
    setSaving(false);
    if (resMetrics.success && allSuccess) {
      alert('Semua data berhasil disimpan!');
      // Synchronize local state with the normalized parsed data we just successfully saved
      setLocalCustomMetrics(updatedLocalMetrics);
    } else {
      alert('Gagal menyimpan data: ' + (errorMessage || 'Unknown error'));
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName) return;
    
    // Initialize locally with year 2025 and empty score.
    // The database write will only occur when the user clicks "Simpan Semua".
    const initialData = [{ year: '2025', score: '' }];
    
    setLocalCustomMetrics(prev => ({
      ...prev,
      [newCategoryName]: initialData
    }));
    setNewCategoryName('');
  };

  const handleDeleteYear = async (category, index) => {
    const categoryData = localCustomMetrics[category] || [];
    const rowToDelete = categoryData[index];
    
    // 1. Update local state immediately for snappy response
    const updatedData = categoryData.filter((_, idx) => idx !== index);
    setLocalCustomMetrics(prev => ({
      ...prev,
      [category]: updatedData
    }));
    
    // 2. If the row has a database ID, delete it from Supabase as well
    if (rowToDelete && rowToDelete.id) {
      setSaving(true);
      const res = await deleteChartDataRow(rowToDelete.id);
      setSaving(false);
      
      if (!res.success) {
        alert('Gagal menghapus data dari database: ' + (res.error?.message || 'Unknown error'));
        // Rollback local state
        setLocalCustomMetrics(prev => ({
          ...prev,
          [category]: categoryData
        }));
      } else {
        // Sync context state
        setCustomMetrics(prev => ({
          ...prev,
          [category]: updatedData
        }));
      }
    }
  };

  const handleUpdateLocalCategoryData = (category, index, field, value) => {
    setLocalCustomMetrics(prev => {
      const categoryData = prev[category] || [];
      let newData = [...categoryData];
      
      if (index === -1) {
        newData = [{ 
          year: new Date().getFullYear().toString(), 
          score: field === 'score' ? value : '',
          [field]: value 
        }];
      } else {
        newData[index] = { ...newData[index], [field]: value };
      }
      
      return {
        ...prev,
        [category]: newData
      };
    });
  };

  const handleAddYear = (category) => {
    const categoryData = localCustomMetrics[category] || [];
    const lastYear = categoryData.length > 0 
      ? parseInt(categoryData[categoryData.length - 1].year) 
      : new Date().getFullYear();
    
    setLocalCustomMetrics(prev => ({
      ...prev,
      [category]: [...categoryData, { year: (lastYear + 1).toString(), score: '' }]
    }));
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori ${category}?`)) return;
    setSaving(true);
    const res = await deleteCategory(category);
    setSaving(false);
    if (res.success) {
      setLocalCustomMetrics(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      alert(`Kategori ${category} berhasil dihapus!`);
    } else {
      alert('Gagal menghapus kategori: ' + (res.error?.message || 'Unknown error'));
    }
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

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#020617', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck color="white" size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Login</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Masukkan password untuk mengakses panel</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <input 
                type="password" 
                placeholder="Password Admin" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white', fontSize: '1rem' }}
                autoFocus
              />
              {loginError && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{loginError}</p>}
            </div>
            <button type="submit" className="attendance-btn" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              Login
            </button>
            <button type="button" onClick={() => window.location.href = '/'} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Kembali ke Beranda
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <SidebarItem id="presensi" icon={Clock} label="Riwayat Presensi" />

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600 
            }}
          >
            <LayoutDashboard size={20} /> Lihat Dashboard
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('adminLoggedIn');
              window.location.reload();
            }}
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
            <LogOut size={20} /> Keluar (Logout)
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Add Category Section */}
              <section className="glass-card">
                <h3 className="section-title"><span></span> Tambah Kategori Baru</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Tambahkan metrik kinerja tahunan lainnya (Contoh: SAKIP, RB, IPP, IKM).</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input placeholder="Nama Metrik" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ flex: 1, background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                  <button onClick={handleAddCategory} className="attendance-btn">Tambah Kategori</button>
                </div>
              </section>
            </div>

            {/* Detailed Category Management */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              {Object.keys(localCustomMetrics || {}).sort().map(category => (
                <section key={category} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}><span></span> Data {category}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleAddYear(category)} className="refresh-btn" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '0.5rem' }}>+ Tahun</button>
                      <button onClick={() => handleDeleteCategory(category)} className="refresh-btn" style={{ color: 'var(--accent)', padding: '0.4rem' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.5rem', fontWeight: 600 }}>Tahun</th>
                          <th style={{ padding: '0.5rem', fontWeight: 600 }}>Skor / Nilai</th>
                          <th style={{ padding: '0.5rem', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(localCustomMetrics[category] || []).map((data, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" 
                                value={data.year} 
                                onChange={(e) => handleUpdateLocalCategoryData(category, index, 'year', e.target.value)} 
                                style={{ width: '80px', background: 'transparent', border: '1px solid transparent', padding: '0.4rem', borderRadius: '0.4rem', color: 'white', transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                onBlur={(e) => e.target.style.borderColor = 'transparent'}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" 
                                inputMode="decimal"
                                value={data.score} 
                                onChange={(e) => handleUpdateLocalCategoryData(category, index, 'score', e.target.value)} 
                                style={{ width: '100%', background: 'transparent', border: '1px solid transparent', padding: '0.4rem', borderRadius: '0.4rem', color: 'white', transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                                onBlur={(e) => e.target.style.borderColor = 'transparent'}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              <button 
                                onClick={() => handleDeleteYear(category, index)} 
                                className="refresh-btn" 
                                style={{ color: 'var(--accent)', padding: '0.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Hapus Tahun"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ margin: 0 }}><span></span> Kelola Struktur Organisasi</h3>
                <button 
                  onClick={() => updateOrgStructure(Array.isArray(orgStructure) ? '' : [])} 
                  className="refresh-btn" 
                  style={{ fontSize: '0.75rem' }}
                >
                  {Array.isArray(orgStructure) ? 'Ganti ke Mode Gambar URL' : 'Ganti ke Mode Dinamis (Input Field)'}
                </button>
              </div>

              {!Array.isArray(orgStructure) ? (
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Masukkan URL gambar struktur organisasi.</p>
                  <input 
                    placeholder="https://example.com/struktur.jpg" 
                    value={typeof orgStructure === 'string' ? orgStructure : ''} 
                    onChange={(e) => setOrgStructure(e.target.value)} 
                    style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '0.75rem', color: 'white' }} 
                  />
                  <button onClick={() => updateOrgStructure(orgStructure)} disabled={saving} className="attendance-btn" style={{ alignSelf: 'flex-start' }}>
                    {saving ? '...' : 'Simpan URL Gambar'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Nama Unit / Jabatan</label>
                      <input placeholder="Contoh: Kepala Biro" value={newOrgNode.name} onChange={(e) => setNewOrgNode({ ...newOrgNode, name: e.target.value })} style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Deskripsi / Role</label>
                      <input placeholder="Contoh: Pimpinan" value={newOrgNode.role} onChange={(e) => setNewOrgNode({ ...newOrgNode, role: e.target.value })} style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Atasan (Parent)</label>
                      <select 
                        value={newOrgNode.parentId} 
                        onChange={(e) => setNewOrgNode({ ...newOrgNode, parentId: e.target.value })} 
                        style={{ width: '100%', background: 'var(--bg-accent)', border: '1px solid var(--glass-border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }}
                      >
                        <option value="">-- No Parent (Root) --</option>
                        {orgStructure.map(n => (
                          <option key={n.id} value={n.id}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleAddOrgNode} className="attendance-btn">Tambah</button>
                  </div>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '0.75rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-accent)' }}>
                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.75rem' }}>Unit / Jabatan</th>
                          <th style={{ padding: '0.75rem' }}>Atasan</th>
                          <th style={{ padding: '0.75rem' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgStructure.map(n => (
                          <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem' }}><strong>{n.name}</strong><br/><small>{n.role}</small></td>
                            <td style={{ padding: '0.75rem' }}>{orgStructure.find(p => p.id === n.parentId)?.name || '-'}</td>
                            <td style={{ padding: '0.75rem' }}><button onClick={() => deleteOrgNode(n.id)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button></td>
                          </tr>
                        ))}
                        {orgStructure.length === 0 && <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data unit.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'presensi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section className="glass-card">
              <h3 className="section-title"><span></span> Riwayat Presensi Pegawai</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Daftar 50 rekaman absensi terakhir dari semua pegawai.</p>
              
              <div style={{ overflowX: 'auto', background: 'var(--bg-accent)', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>Waktu Check-In</th>
                      <th style={{ padding: '1rem' }}>Nama Pegawai</th>
                      <th style={{ padding: '1rem' }}>Tipe</th>
                      <th style={{ padding: '1rem' }}>Lokasi / IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory && attendanceHistory.length > 0 ? attendanceHistory.map((record) => (
                      <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', color: 'white' }}>{record.timestamp ? new Date(record.timestamp).toLocaleString('id-ID') : '-'}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{record.employees?.name || 'Unknown'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', background: record.type === 'Check-In' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: record.type === 'Check-In' ? 'var(--secondary)' : '#60a5fa' }}>
                            {record.type}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{record.location || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data riwayat absensi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;

