import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import PatientVaccinationDoctorStyleView from '../components/PatientVaccinationDoctorStyleView';
import './DoctorDetailPage.css';

function PatientVaccinationsPage() {
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
        <h1>💉 {t('my_vaccinations')}</h1>
        <div className="detail-content full-width">
          <PatientVaccinationDoctorStyleView patientId={patientInfo._id} />
        </div>
      </div>
    </div>
  );
}

export default PatientVaccinationsPage;
