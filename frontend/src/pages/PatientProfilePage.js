import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import ProfileManagement from '../components/ProfileManagement';
import apiClient from '../utils/api';
import './PatientDetailPage.css';

function PatientProfilePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || 'null');
        if (patientInfo && patientInfo._id) {
          setPatient(patientInfo);
        } else {
          const response = await apiClient.get('/patients/dashboard/info');
          if (response.data.patient) {
            setPatient(response.data.patient);
            localStorage.setItem('patientInfo', JSON.stringify(response.data.patient));
          }
        }
      } catch (error) {
        console.error('Error fetching patient info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientInfo();
  }, []);

  if (loading || !patient) {
    return (
      <div className="patient-detail-page">
        <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
          <FaArrowLeft /> {t('back_to_dashboard')}
        </button>
        <div className="detail-container">
          <h1>{loading ? t('loading') : t('error_loading')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-detail-page">
      <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
        <FaArrowLeft /> {t('back_to_dashboard')}
      </button>
      <div className="detail-container">
        <h1>👤 {t('my_profile')}</h1>
        <div className="detail-content full-width">
          <ProfileManagement />
        </div>
      </div>
    </div>
  );
}

export default PatientProfilePage;
