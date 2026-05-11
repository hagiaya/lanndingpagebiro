import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Initialize from localStorage or defaults
  const [sakipData, setSakipData] = useState(() => {
    const saved = localStorage.getItem('sakipData');
    return saved ? JSON.parse(saved) : [
      { year: '2022', score: 78.5 },
      { year: '2023', score: 82.3 },
      { year: '2024', score: 85.1 },
    ];
  });

  const [rbData, setRbData] = useState(() => {
    const saved = localStorage.getItem('rbData');
    return saved ? JSON.parse(saved) : [
      { year: '2022', score: 72.1 },
      { year: '2023', score: 75.8 },
      { year: '2024', score: 79.4 },
    ];
  });

  const [metrics, setMetrics] = useState(() => {
    const saved = localStorage.getItem('metrics');
    return saved ? JSON.parse(saved) : { ipp: 4.82, ikm: 88.4, hadir: 42, total: 45 };
  });

  const [officials, setOfficials] = useState(() => {
    const saved = localStorage.getItem('officials');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'H. Ahmad Syarif, M.Si', role: 'Kepala Biro', status: 'In', location: 'Kantor', time: '07:30' },
      { id: 2, name: 'Dra. Siti Aminah', role: 'Kabag Umum', status: 'Out', location: 'Rapat di Kantor Gubernur', time: '09:00', return: '14:00' },
      { id: 3, name: 'Budi Santoso, S.T', role: 'Kasubag Keuangan', status: 'In', location: 'Kantor', time: '08:15' },
      { id: 4, name: 'Lia Marlina, S.Kom', role: 'Pranata Komputer', status: 'Out', location: 'Dinas Luar (Jakarta)', time: '10-05-2026', return: '13-05-2026' },
    ];
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activities');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Rapat Koordinasi SAKIP', status: 'Ongoing', time: '09:00 - 12:00' },
      { id: 2, title: 'Workshop Reformasi Birokrasi', status: 'Upcoming', time: 'Besok, 08:30' },
      { id: 3, title: 'Sosialisasi Budaya BerAKHLAK', status: 'Upcoming', time: '15 Mei 2026' },
    ];
  });

  const [mails, setMails] = useState(() => {
    const saved = localStorage.getItem('mails');
    return saved ? JSON.parse(saved) : [
      { id: 1, subject: 'Undangan Rapat Evaluasi Kinerja', from: 'Sekretariat Daerah', date: '11 Mei 2026' },
      { id: 2, subject: 'Permohonan Data Kepegawaian', from: 'BKD', date: '10 Mei 2026' },
      { id: 3, subject: 'Surat Edaran Libur Nasional', from: 'Kemenpan RB', date: '09 Mei 2026' },
    ];
  });

  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('photos');
    return saved ? JSON.parse(saved) : [
      { id: 1, url: '/images/activity1.png', title: 'Rapat Strategi Pembangunan 2024' },
      { id: 2, url: '/images/activity2.png', title: 'Pelayanan Publik Prima' },
      { id: 3, url: '/images/activity3.png', title: 'Seminar Nasional Reformasi' },
    ];
  });

  const [berakhlakData, setBerakhlakData] = useState(() => {
    const saved = localStorage.getItem('berakhlakData');
    return saved ? JSON.parse(saved) : [
      { year: '2022', score: 88.2 },
      { year: '2023', score: 91.5 },
      { year: '2024', score: 94.8 },
    ];
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('sakipData', JSON.stringify(sakipData));
    localStorage.setItem('rbData', JSON.stringify(rbData));
    localStorage.setItem('metrics', JSON.stringify(metrics));
    localStorage.setItem('officials', JSON.stringify(officials));
    localStorage.setItem('activities', JSON.stringify(activities));
    localStorage.setItem('mails', JSON.stringify(mails));
    localStorage.setItem('photos', JSON.stringify(photos));
    localStorage.setItem('berakhlakData', JSON.stringify(berakhlakData));
  }, [sakipData, rbData, metrics, officials, activities, mails, photos, berakhlakData]);

  return (
    <DataContext.Provider value={{
      sakipData, setSakipData,
      rbData, setRbData,
      metrics, setMetrics,
      officials, setOfficials,
      activities, setActivities,
      mails, setMails,
      photos, setPhotos,
      berakhlakData, setBerakhlakData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
