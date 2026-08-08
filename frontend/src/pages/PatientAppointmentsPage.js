import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import AppointmentModule from '../components/AppointmentModule';
import PatientAppointments from '../components/PatientAppointments';
import apiClient from '../utils/api';
import './PatientDetailPage.css';

function PatientAppointmentsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

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
          } else {
            setError(t('please_login_appointments'));
            setTimeout(() => navigate('/login'), 2000);
          }
        }
      } catch (error) {
        console.error('Error fetching patient info:', error);
        setError(t('unable_load_appointments'));
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientInfo();

    const fetchDoctors = async () => {
      try {
        const res = await apiClient.get('/doctors');
        setDoctors(res.data || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const handleAppointmentBooked = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="patient-detail-page">
        <div className="detail-container">
          <h1>⚠️ {t('session_error')}</h1>
          <div className="detail-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#d32f2f', fontSize: '16px', marginBottom: '20px' }}>
                {error}
              </p>
              <button 
                className="btn-submit" 
                onClick={() => navigate('/login')}
                style={{ marginTop: '10px' }}
              >
                {t('go_to_login')}
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => {
                  localStorage.removeItem('patientInfo');
                  localStorage.removeItem('token');
                  navigate('/');
                }}
                style={{ marginLeft: '10px' }}
              >
                {t('delete_session')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !patient) {
    return (
      <div className="patient-detail-page">
        <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
          <FaArrowLeft /> {t('back_to_dashboard')}
        </button>
        <div className="detail-container">
          <h1>📅 {t('loading_appointments')}</h1>
          <div className="detail-content">
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              {t('fetching_appointments')}
            </div>
          </div>
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
        <h1>📅 {t('my_appointments')}</h1>
        <div className="detail-content full-width">
          {/* Left column: Book Appointment */}
          <div>
            <AppointmentModule patient={patient} doctors={doctors} onBooked={handleAppointmentBooked} />
          </div>
          {/* Right column: View Appointments */}
          <div>
            {patient && patient._id ? (
              <PatientAppointments patientId={patient._id} refreshKey={refreshKey} doctors={doctors} />
            ) : (
              <div className="no-data">{t('loading_patient_appointments')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointmentsPage;
