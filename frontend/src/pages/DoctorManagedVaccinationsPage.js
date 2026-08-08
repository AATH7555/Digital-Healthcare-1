import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import VaccinationManager from '../components/VaccinationManager';
import './DoctorDetailPage.css';

function DoctorManagedVaccinationsPage() {
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
        <h1>🩹 Manage Vaccinations</h1>
        <div className="detail-content full-width">
          <VaccinationManager patientId={patientId} />
        </div>
      </div>
    </div>
  );
}

export default DoctorManagedVaccinationsPage;
