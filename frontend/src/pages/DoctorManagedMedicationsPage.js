import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import MedicationManager from '../components/MedicationManager';
import './DoctorDetailPage.css';

function DoctorManagedMedicationsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const selectedPatient = JSON.parse(localStorage.getItem('selectedPatient') || 'null');

  const handleBack = () => {
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
        <h1>💊 Manage Medications</h1>
        <div className="detail-content full-width">
          <MedicationManager patientId={patientId} />
        </div>
      </div>
    </div>
  );
}

export default DoctorManagedMedicationsPage;
