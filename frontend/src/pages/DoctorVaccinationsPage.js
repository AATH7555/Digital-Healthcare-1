import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import VaccinationsList from '../components/VaccinationsList';
import './DoctorDetailPage.css';

function DoctorVaccinationsPage() {
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
        <h1>💉 Vaccinations</h1>
        <div className="detail-content full-width">
          <VaccinationsList patientId={patientId} />
        </div>
      </div>
    </div>
  );
}

export default DoctorVaccinationsPage;
