import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DoctorPatientQRScanner from '../components/DoctorPatientQRScanner';
import './DoctorDetailPage.css';

function DoctorQRCodeScanPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/doctor-dashboard');
  };

  return (
    <div className="doctor-detail-page">
      <button className="top-back-button" onClick={handleBack}>
        <FaArrowLeft /> Back to Dashboard
      </button>
      <div className="detail-container">
        <h1>📱 Patient QR Code Scanner</h1>
        <p className="page-subtitle">Scan any patient's QR code to instantly view their profile, medications, and vaccinations</p>
        <div className="detail-content full-width">
          <DoctorPatientQRScanner />
        </div>
      </div>
    </div>
  );
}

export default DoctorQRCodeScanPage;
