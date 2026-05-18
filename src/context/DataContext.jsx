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
  const [orgStructure, setOrgStructure] = useState([]);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [lastProcessedId, setLastProcessedId] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
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
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('attendance').select('*').order('timestamp', { ascending: false }).limit(50)
      ]);

      // Process employees with daily auto-reset
      if (results[0].status === 'fulfilled' && results[0].value.data) {
        const employees = results[0].value.data;
        const today = new Date().toDateString();
        
        const processedEmployees = employees.map(emp => {
          const isToday = emp.last_seen && new Date(emp.last_seen).toDateString() === today;
          return {
            ...emp,
            status: isToday ? emp.status : 'Out',
          };
        });
        
        setOfficials(processedEmployees);
        const hadirCount = processedEmployees.filter(e => e.status === 'In' || e.status === 'Kantor').length;
        setMetrics(prev => ({ ...prev, hadir: hadirCount, total: processedEmployees.length }));
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
      } else {
        // Only load mock if we have nothing yet (using functional updates to avoid dependency)
        setCustomMetrics(prev => {
          if (!prev || Object.keys(prev).length === 0) {
            return {
              SAKIP: [{ year: '2022', score: 78.5 }, { year: '2023', score: 82.3 }, { year: '2024', score: 85.1 }],
              RB: [{ year: '2022', score: 72.1 }, { year: '2023', score: 75.8 }, { year: '2024', score: 79.4 }]
            };
          }
          return prev;
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
        
        // Handle Org Structure URL or JSON
        // Handle Org Structure URL or JSON
        const orgStat = kpiStats.find(s => s.key === 'ORG_STRUCTURE');
        const orgData = orgStat?.label || orgStat?.value; // Fallback to value if label is empty
        if (orgData) {
          try {
            const parsed = JSON.parse(orgData);
            setOrgStructure(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setOrgStructure(orgData.toString());
          }
        } else {
          setOrgStructure([]);
        }
      }

      if (results[3].status === 'fulfilled' && results[3].value.data) setActivities(results[3].value.data);
      if (results[4].status === 'fulfilled' && results[4].value.data) setMails(results[4].value.data);
      if (results[5].status === 'fulfilled' && results[5].value.data) setPhotos(results[5].value.data);
      
      // Manually map employee names to attendance history to avoid Supabase join errors
      if (results[6].status === 'fulfilled' && results[6].value.data) {
        let historyData = results[6].value.data;
        if (results[0].status === 'fulfilled' && results[0].value.data) {
          const empList = results[0].value.data;
          historyData = historyData.map(record => {
            const emp = empList.find(e => e.id === record.employee_id);
            return {
              ...record,
              employees: { name: emp ? emp.name : 'Unknown' }
            };
          });
        }
        setAttendanceHistory(historyData);
      } else if (results[6].status === 'rejected') {
        console.error('Attendance history fetch failed:', results[6].reason);
      }

    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMockData = () => {
    setCustomMetrics({
      SAKIP: [{ year: '2022', score: 78.5 }, { year: '2023', score: 82.3 }, { year: '2024', score: 85.1 }],
      RB: [{ year: '2022', score: 72.1 }, { year: '2023', score: 75.8 }, { year: '2024', score: 79.4 }],
      Budker: [{ year: '2024', score: 88.2 }, { year: '2025', score: 91.5 }, { year: '2026', score: 94.8 }]
    });
    setOrgStructure('https://images.unsplash.com/photo-1454165833767-131435bb4696?q=80&w=2070&auto=format&fit=crop');
    // ... other mocks
  };

  // Global Attendance Listener - Polling every 3 seconds
  useEffect(() => {
    let isInitial = true;
    
    const pollAttendance = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('id, employee_id, type, timestamp')
          .order('timestamp', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const latest = data[0];
          
          // On first run, just set the lastProcessedId to the latest existing record
          if (isInitial) {
            setLastProcessedId(latest.id);
            isInitial = false;
            return;
          }

          if (latest.id !== lastProcessedId && latest.type === 'Check-In') {
            console.log('New attendance record found:', latest);
            const recordTime = new Date(latest.timestamp).getTime();
            const now = Date.now();
            
            // Only process if it happened in the last 60 seconds
            if (now - recordTime < 60000) {
              setLastProcessedId(latest.id);
              fetchData();
              
              const { data: emp } = await supabase.from('employees').select('name').eq('id', latest.employee_id).single();
              if (emp) {
                const checkInDate = new Date(latest.created_at);
                const hour = checkInDate.getHours();
                const minute = checkInDate.getMinutes();
                
                // Threshold 07:30
                const thresholdHour = 7;
                const thresholdMinute = 30;
                const isLate = hour > thresholdHour || (hour === thresholdHour && minute > thresholdMinute);
                
                let lateMinutes = 0;
                let lateText = '';
                if (isLate) {
                  lateMinutes = (hour * 60 + minute) - (thresholdHour * 60 + thresholdMinute);
                  const h = Math.floor(lateMinutes / 60);
                  const m = lateMinutes % 60;
                  lateText = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
                }

                const msg = isLate 
                  ? `⚠️ ${emp.name} (Terlambat ${lateText})` 
                  : `✅ ${emp.name} (Tepat Waktu)`;
                
                console.log('Triggering notification:', msg);
                setAttendanceMessage(msg);
                
                const voiceMsg = isLate 
                  ? `Selamat datang ${emp.name}. Anda terlambat ${lateText}, ayo lebih semangat lagi!` 
                  : `Selamat datang ${emp.name}. Terima kasih sudah datang tepat waktu!`;
                
                try {
                  const utterance = new SpeechSynthesisUtterance(voiceMsg);
                  utterance.lang = 'id-ID';
                  utterance.rate = 0.9; // Slightly slower for clarity
                  window.speechSynthesis.speak(utterance);
                } catch (speechErr) {
                  console.error('Voice synthesis error:', speechErr);
                }
                
                setTimeout(() => setAttendanceMessage(''), 10000);
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    const interval = setInterval(pollAttendance, 3000);
    return () => clearInterval(interval);
  }, [lastProcessedId, fetchData]);

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

  const updateOrgStructure = async (data) => {
    try {
      const valueText = typeof data === 'string' ? data : JSON.stringify(data);
      
      // First, try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('kpi_stats')
        .update({ label: valueText, value: 0 }) // Store in label (text/json support)
        .eq('key', 'ORG_STRUCTURE')
        .select();

      if (updateError) throw updateError;

      // If no record was updated, insert a new one
      if (!updateData || updateData.length === 0) {
        const { error: insertError } = await supabase
          .from('kpi_stats')
          .insert({ key: 'ORG_STRUCTURE', label: valueText, value: 0 });
        if (insertError) throw insertError;
      }

      setOrgStructure(data);
      return { success: true };
    } catch (error) {
      console.error('Error updating org structure:', error);
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
      attendanceMessage, setAttendanceMessage,
      attendanceHistory,
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


