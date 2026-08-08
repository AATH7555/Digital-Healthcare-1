import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import DoctorVaccinationView from '../components/DoctorVaccinationView';
import './DoctorDetailPage.css';

function PatientVaccinationDoctorViewPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || 'null');

  const handleBack = () => {
    navigate('/patient-dashboard');
  };

  if (!patientInfo || !patientInfo._id) {
    return (
      <div className="doctor-detail-page">
        <button className="top-back-button" onClick={handleBack}>
          <FaArrowLeft /> {t('back')}
        </button>
        <div className="detail-container">
          <h1>{t('error_loading')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-detail-page">
      <button className="top-back-button" onClick={handleBack}>
        <FaArrowLeft /> {t('back')}
      </button>
      <div className="detail-container">
        <h1>🩺 {t('vaccination_doctor_view')}</h1>
        <div className="detail-content full-width">
          <DoctorVaccinationView patientId={patientInfo._id} readOnly={true} />
        </div>
      </div>
    </div>
  );
}

export default PatientVaccinationDoctorViewPage;
