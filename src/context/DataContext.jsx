import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // State for all data
  const [customMetrics, setCustomMetrics] = useState({}); // { SAKIP: [...], RB: [...], Budker: [...] }
  const [metrics, setMetrics] = useState({ ipp: 0, ikm: 0, hadir: 0, total: 0 });
  const [officials, setOfficials] = useState([]);
  const [activities, setActivities] = useState([]);
  const [mails, setMails] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [orgStructure, setOrgStructure] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        supabase.from('employees').select('*').order('name'),
        supabase.from('dashboard_metrics').select('*').order('year'),
        supabase.from('kpi_stats').select('*'),
        supabase.from('activities').select('*').order('date', { ascending: false }).limit(5),
        supabase.from('mails').select('*').order('date_received', { ascending: false }).limit(5),
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(6)
      ]);

      // Process employees
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        const employees = results[0].value.data;
        setOfficials(employees);
        const hadirCount = employees.filter(e => e.status === 'In').length;
        setMetrics(prev => ({ ...prev, hadir: hadirCount, total: employees.length }));
      }

      // Process dashboard metrics
      if (results[1].status === 'fulfilled' && results[1].value.data) {
        const dashboardMetrics = results[1].value.data;
        const grouped = dashboardMetrics.reduce((acc, m) => {
          if (!acc[m.category]) acc[m.category] = [];
          acc[m.category].push(m);
          return acc;
        }, {});
        setCustomMetrics(grouped);
      } else if (!customMetrics || Object.keys(customMetrics).length === 0) {
        // Only load mock if we have nothing yet
        setCustomMetrics({
          SAKIP: [{ year: '2022', score: 78.5 }, { year: '2023', score: 82.3 }, { year: '2024', score: 85.1 }],
          RB: [{ year: '2022', score: 72.1 }, { year: '2023', score: 75.8 }, { year: '2024', score: 79.4 }]
        });
      }

      // Process KPI stats (IPP/IKM)
      if (results[2].status === 'fulfilled' && results[2].value.data) {
        const kpiStats = results[2].value.data;
        const statsObj = kpiStats.reduce((acc, curr) => {
          acc[curr.key.toLowerCase()] = curr.value;
          return acc;
        }, {});
        setMetrics(prev => ({ ...prev, ...statsObj }));
        
        // Handle Org Structure URL (if it's in a different format or as a string value in another table, but we'll use kpi_stats)
        const orgStat = kpiStats.find(s => s.key === 'ORG_STRUCTURE');
        if (orgStat) setOrgStructure(orgStat.value_text || orgStat.value); // Assuming value_text or value
      }

      if (results[3].status === 'fulfilled' && results[3].value.data) setActivities(results[3].value.data);
      if (results[4].status === 'fulfilled' && results[4].value.data) setMails(results[4].value.data);
      if (results[5].status === 'fulfilled' && results[5].value.data) setPhotos(results[5].value.data);

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [customMetrics]);

  const loadMockData = () => {
    setCustomMetrics({
      SAKIP: [{ year: '2022', score: 78.5 }, { year: '2023', score: 82.3 }, { year: '2024', score: 85.1 }],
      RB: [{ year: '2022', score: 72.1 }, { year: '2023', score: 75.8 }, { year: '2024', score: 79.4 }],
      Budker: [{ year: '2024', score: 88.2 }, { year: '2025', score: 91.5 }, { year: '2026', score: 94.8 }]
    });
    setOrgStructure('https://images.unsplash.com/photo-1454165833767-131435bb4696?q=80&w=2070&auto=format&fit=crop');
    // ... other mocks
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateAttendance = async (employeeId, status, location, photoUrl) => {
    try {
      await supabase.from('employees').update({ status, last_location: location, last_seen: new Date().toISOString() }).eq('id', employeeId);
      await supabase.from('attendance').insert({ 
        employee_id: employeeId, 
        type: status === 'In' ? 'Check-In' : 'Check-Out', 
        location,
        photo_url: photoUrl // Storing the base64 or URL
      });
      setOfficials(prev => prev.map(emp => emp.id === employeeId ? { ...emp, status, last_location: location } : emp));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateMetrics = async (newMetrics) => {
    try {
      const updates = Object.entries(newMetrics).map(([key, value]) => ({ key: key.toUpperCase(), value: parseFloat(value) }));
      await supabase.from('kpi_stats').upsert(updates);
      setMetrics(newMetrics);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateChartData = async (category, newData) => {
    try {
      await supabase.from('dashboard_metrics').upsert(newData.map(d => ({ ...d, category })));
      setCustomMetrics(prev => ({ ...prev, [category]: newData }));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteCategory = async (category) => {
    try {
      await supabase.from('dashboard_metrics').delete().eq('category', category);
      setCustomMetrics(prev => {
        const next = { ...prev };
        delete next[category];
        return next;
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addEmployee = async (employee) => {
    try {
      const { data, error } = await supabase.from('employees').insert(employee).select();
      if (error) throw error;
      setOfficials(prev => [...prev, data[0]]);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await supabase.from('employees').delete().eq('id', id);
      setOfficials(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addActivity = async (activity) => {
    try {
      const { data, error } = await supabase.from('activities').insert(activity).select();
      if (error) throw error;
      setActivities(prev => [data[0], ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteActivity = async (id) => {
    try {
      await supabase.from('activities').delete().eq('id', id);
      setActivities(prev => prev.filter(a => a.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addMail = async (mail) => {
    try {
      const { data, error } = await supabase.from('mails').insert(mail).select();
      if (error) throw error;
      setMails(prev => [data[0], ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteMail = async (id) => {
    try {
      await supabase.from('mails').delete().eq('id', id);
      setMails(prev => prev.filter(m => m.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addPhoto = async (photo) => {
    try {
      const { data, error } = await supabase.from('photos').insert(photo).select();
      if (error) throw error;
      setPhotos(prev => [data[0], ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deletePhoto = async (id) => {
    try {
      await supabase.from('photos').delete().eq('id', id);
      setPhotos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateOrgStructure = async (url) => {
    try {
      await supabase.from('kpi_stats').upsert({ key: 'ORG_STRUCTURE', value_text: url });
      setOrgStructure(url);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return (
    <DataContext.Provider value={{
      customMetrics, setCustomMetrics,
      metrics, setMetrics,
      officials, setOfficials,
      activities, setActivities,
      mails, setMails,
      photos, setPhotos,
      orgStructure, setOrgStructure,
      loading,
      fetchData,
      updateAttendance,
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
      updateOrgStructure
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Final DataContext Export - Forced Reload v2
export const useData = () => useContext(DataContext);


