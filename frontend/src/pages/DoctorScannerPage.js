import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import QRScanner from '../components/QRScanner';
import './DoctorDetailPage.css';

function DoctorScannerPage() {
  const navigate = useNavigate();
  const patientData = JSON.parse(localStorage.getItem('selectedPatient') || '{}');

  const handleBack = () => {
    const selectedPatient = JSON.parse(localStorage.getItem('selectedPatient') || 'null');
    if (selectedPatient) {
      navigate('/doctor-dashboard', { state: { selectedPatient } });
    } else {
      navigate('/doctor-dashboard');
    }
  };

  return (
    <div className="doctor-detail-page">
      <button className="top-back-button" onClick={handleBack}>
        <FaArrowLeft /> Back
      </button>
      <div className="detail-container">
        <h1>🔍 QR Code Scanner</h1>
        <div className="detail-content">
          <QRScanner patientData={patientData} />
        </div>
      </div>
    </div>
  );
}

export default DoctorScannerPage;
