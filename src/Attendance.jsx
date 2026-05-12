import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { TOTP, Secret } from 'otpauth';
import { useData } from './context/DataContext';
import { ArrowLeft, User, QrCode, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = ({ onBack }) => {
  const { officials, updateAttendance } = useData();
  const [step, setStep] = useState(1); // 1: Name, 2: Selfie, 3: Success
  const isMobileView = window.location.pathname === '/attendance' || window.innerWidth < 800;
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [status, setStatus] = useState('In');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (step === 2) {
      // Added slightly longer delay to ensure DOM element 'reader' is available
      const timer = setTimeout(() => {
        const element = document.getElementById('reader');
        if (!element) return;

        scanner = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 } 
        });

        scanner.render((decodedText) => {
          console.log('QR Scanned:', decodedText);
          scanner.clear().catch(e => console.error("Error clearing scanner", e));
          setStep(3);
        }, (err) => {
          // silent error for scanning
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        if (scanner) {
          scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        }
      };
    }
  }, [step]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setStep(2); // Go to Selfie step
  };

  const handleCapture = async () => {
    const video = document.getElementById('webcam');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const photo = canvas.toDataURL('image/jpeg');
    setCapturedImage(photo);
    
    setLoading(true);
    setError('');
    
    try {
      const res = await updateAttendance(selectedEmployee.id, status, 'Kantor Biro Organisasi', photo);
      if (res.success) {
        setStep(3); // Success
      } else {
        setError('Gagal mencatat absensi. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat verifikasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let stream = null;
    if (step === 2) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(s => {
          stream = s;
          const video = document.getElementById('webcam');
          if (video) {
            video.srcObject = s;
            setIsCameraReady(true);
          }
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [step]);

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <div className="attendance-header">
          <button onClick={onBack} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <h2>Presensi Pegawai</h2>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3>Pilih Nama Anda</h3>
              <div className="employee-list">
                {officials.map(emp => (
                  <button 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)}
                    className="employee-item"
                  >
                    <User size={18} />
                    <span>{emp.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content"
            >
              <h3>Ambil Foto Selfie</h3>
              <p>Pastikan wajah terlihat jelas untuk verifikasi.</p>
              <div style={{ position: 'relative', width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#000', marginBottom: '1.5rem' }}>
                <video id="webcam" autoPlay playsInline style={{ width: '100%', display: 'block' }}></video>
                {!isCameraReady && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Memulai Kamera...</div>}
              </div>
              {error && <p className="error-text">{error}</p>}
              <button 
                onClick={handleCapture}
                disabled={!isCameraReady || loading}
                className="submit-btn"
                style={{ background: 'var(--secondary)' }}
              >
                {loading ? 'Mengirim...' : 'Ambil Foto & Absen'}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="step-content success-view"
            >
              <CheckCircle2 size={64} className="icon-success" />
              <h2>Berhasil!</h2>
              <p>Presensi {status === 'In' ? 'Masuk' : 'Keluar'} anda telah tercatat.</p>
              <div className="success-details">
                <strong>{selectedEmployee?.name}</strong>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <button onClick={onBack} className="finish-btn">Selesai</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .attendance-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .attendance-card {
          background: white;
          width: 100%;
          max-width: 450px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .attendance-header {
          padding: 20px;
          background: #1e293b;
          color: white;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .attendance-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .step-content {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .employee-list {
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .employee-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
          color: #1e293b;
        }

        .employee-item:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .qr-reader {
          width: 100%;
          margin: 20px 0;
          border-radius: 16px;
          overflow: hidden;
        }

        .status-toggle {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
          width: 100%;
          margin-top: 20px;
        }

        .status-toggle button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-toggle button.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .icon-primary { color: #3b82f6; margin-bottom: 20px; }
        .icon-success { color: #10b981; margin-bottom: 20px; }

        .totp-input {
          width: 100%;
          max-width: 200px;
          text-align: center;
          font-size: 2rem;
          letter-spacing: 0.5rem;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          margin: 20px 0;
          font-weight: 700;
          color: #1e293b;
        }

        .totp-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
        }

        .submit-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .error-text { color: #ef4444; font-size: 0.875rem; margin-bottom: 10px; }

        .success-view h2 { color: #1e293b; margin-bottom: 8px; }
        .success-details {
          background: #f0fdf4;
          padding: 15px;
          border-radius: 12px;
          width: 100%;
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .finish-btn {
          width: 100%;
          padding: 14px;
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default Attendance;
