import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import AdminPanel from './Admin';
import Attendance from './Attendance';
import { DataProvider } from './context/DataContext';
import GlobalNotification from './components/GlobalNotification';
import './index.css';

function App() {
  const [showAttendance, setShowAttendance] = useState(false);

  return (
    <DataProvider>
      <Router>
        <div className="relative min-h-screen">
          <GlobalNotification />
          <Routes>
            <Route path="/" element={<Dashboard onOpenAttendance={() => setShowAttendance(true)} />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/attendance" element={<Attendance onBack={() => {}} />} />
          </Routes>
          
          {showAttendance && (
            <Attendance onBack={() => setShowAttendance(false)} />
          )}
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;

