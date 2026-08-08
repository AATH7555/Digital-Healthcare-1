import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import io from 'socket.io-client';
import QRCode from 'qrcode.react';
import { FaPills, FaSyringe, FaQrcode, FaBrain, FaQuestionCircle, FaSignOutAlt, FaHome, FaCalendarAlt, FaBell, FaUser, FaFileAlt, FaVideo } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import MedicationsList from '../components/MedicationsList';
import PatientVaccinationDoctorStyleView from '../components/PatientVaccinationDoctorStyleView';
import AIChat from '../components/AIChat';
import HelpModal from '../components/HelpModal';
import SlidesModal from '../components/SlidesModal';
import AppointmentModule from '../components/AppointmentModule';
import PatientAppointments from '../components/PatientAppointments';
import BookedAppointments from '../components/BookedAppointments';
import HealthAlerts from '../components/HealthAlerts';
import ProfileManagement from '../components/ProfileManagement';
import HealthRecordsExport from '../components/HealthRecordsExport';
import './PatientDashboard.css';

function PatientDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [patient, setPatient] = useState(null);
  const [activeModule, setActiveModule] = useState('home');
  const [showHelp, setShowHelp] = useState(false);
  const [slidesOpen, setSlidesOpen] = useState(false);
  const [tablets, setTablets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [socket, setSocket] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);

  // Fetch patient data from backend
  const fetchPatientData = useCallback(async () => {
    try {
      const response = await apiClient.get('/patients/dashboard/info');

      if (response.data.patient) {
        setPatient(response.data.patient);
        // Update localStorage with latest patient data
        localStorage.setItem('patientInfo', JSON.stringify(response.data.patient));
      }
      if (response.data.tablets) {
        setTablets(response.data.tablets);
      }
      if (response.data.vaccinations) {
        setVaccinations(response.data.vaccinations);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  }, []);

  useEffect(() => {
    const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');
    setPatient(patientInfo);

    // Fetch patient data from backend
    fetchPatientData();

    // Set up interval to refresh patient data every 10 seconds
    // This ensures updates made by doctor are reflected in patient dashboard
    const refreshInterval = setInterval(fetchPatientData, 10000);

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for doctor update notifications
    newSocket.on('patient-data-updated', () => {
      fetchPatientData();
    });

    // Fetch doctors
    const fetchDoctors = async () => {
      try {
        const response = await apiClient.get('/doctors');
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors');
      }
    };

    fetchDoctors();

    return () => {
      clearInterval(refreshInterval);
      newSocket.close();
    };
  }, [fetchPatientData]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('patientInfo');
    onLogout();
    navigate('/');
  };

  const renderContent = () => {
    switch(activeModule) {
      case 'tablets':
        return <MedicationsList patientId={patient?._id} />;
      case 'vaccination':
        return <PatientVaccinationDoctorStyleView patientId={patient?._id} />;
      case 'vaccination-view':
        return <PatientVaccinationDoctorStyleView patientId={patient?._id} />;
      case 'qrcode':
        return (
          <div className="module-content">
            <h3>{t('your_health_qr_code')}</h3>
            <div className="qr-code-container">
              {patient && (
                <>
                  <QRCode
                    value={JSON.stringify({
                      healthId: patient.healthId,
                      name: patient.name,
                      email: patient.email,
                      tablets: tablets.map(t => ({ name: t.tabletName, dosage: t.dosage })),
                      vaccinations: vaccinations.map(v => ({ name: v.vaccinationName, status: v.status }))
                    })}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                  <p>{t('scan_code_to_share')}</p>
                </>
              )}
            </div>
          </div>
        );
      case 'health-ai':
        return <AIChat socket={socket} patient={patient} />;
      case 'appointments':
        return (
          <div className="appointments-section">
            <AppointmentModule patient={patient} doctors={doctors} onBooked={() => setAppointmentsRefreshKey(k => k + 1)} />
            <BookedAppointments patientId={patient?._id} refreshKey={appointmentsRefreshKey} />
          </div>
        );
      case 'alerts':
        return <HealthAlerts patient={patient} />;
      case 'profile':
        return <ProfileManagement user={patient} userType="patient" />;
      case 'export':
        return <HealthRecordsExport patient={patient} />;
      default:
        return (
          <div className="home-content">
            <div className="welcome-header">
              <h1>{t('my_health')}</h1>
              <h2>{t('health_id')}: <span className="health-id">{patient?.healthId}</span></h2>
            </div>
            
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon"><FaPills /></div>
                <div className="stat-info">
                  <h4>{tablets.length}</h4>
                  <p>{t('my_medications')}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FaSyringe /></div>
                <div className="stat-info">
                  <h4>{vaccinations.length}</h4>
                  <p>{t('my_vaccinations')}</p>
                </div>
              </div>
            </div>

            <div className="home-info">
              <h3>{t('my_health')}</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>{t('name')}:</strong> {patient?.name}
                </div>
                <div className="info-item">
                  <strong>{t('email')}:</strong> {patient?.email}
                </div>
                <div className="info-item">
                  <strong>{t('health_id')}:</strong> {patient?.healthId}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="patient-dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <FaHome className="brand-icon" />
            <span>{t('patient_portal')}</span>
          </div>
          <div className="navbar-actions">
            <button className="help-btn" onClick={() => setShowHelp(true)} title={t('settings')}>
              <FaQuestionCircle />
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> {t('logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="patient-info">
            <div className="patient-avatar">{patient?.name?.charAt(0)}</div>
            <h4>{patient?.name}</h4>
            <p>{t('health_id')}: {patient?.healthId}</p>
            <div style={{marginTop:8}}>
              <button className="menu-item" onClick={() => setSlidesOpen(true)}>Slides</button>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button 
              className="menu-item"
              onClick={() => navigate('/patient-dashboard')}
            >
              <FaHome /> {t('my_health')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/medications')}
            >
              <FaPills /> {t('my_medications')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/vaccination-view')}
            >
              💉 {t('my_vaccinations')}
            </button>
            <button
              className="menu-item"
              onClick={() => navigate('/patient/vaccination-doctor-view')}
            >
              🩺 {t('vaccination_view')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/qr-code')}
            >
              <FaQrcode /> {t('qr_code')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/health-ai')}
            >
              <FaBrain /> {t('health_ai')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/appointments')}
            >
              <FaCalendarAlt /> {t('my_appointments')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/meetings')}
            >
              <FaVideo /> {t('doctor_meet')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/health-alerts')}
            >
              <FaBell /> {t('health_alerts')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/profile')}
            >
              <FaUser /> {t('my_profile')}
            </button>
            <button 
              className="menu-item"
              onClick={() => navigate('/patient/health-records')}
            >
              <FaFileAlt /> {t('health_records')}
            </button>

            <LanguageSwitcher />
          </nav>
        </aside>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      <SlidesModal
        open={slidesOpen}
        onClose={() => setSlidesOpen(false)}
        slides={[
          { title: 'Medications', body: `00 Medications\nList of active medications and schedules` },
          { title: 'My Vaccinations', body: `My Vaccinations\nOverview of immunizations` },
          { title: 'Vaccination Doctor View', body: `Vaccination Doctor View\nDetails provided by doctors` },
          { title: 'QR Code', body: `QR Code\nShareable health QR for emergencies` },
          { title: 'Health AI', body: `Health AI\nAsk the AI for guidance and tips` },
          { title: 'Appointments', body: `Appointments\nUpcoming and past appointments` },
          { title: 'Profile', body: `Profile\nManage your personal information` },
          { title: 'Export Records', body: `Export Records\nDownload or export health records` }
        ]}
      />
    </div>
  );
}

export default PatientDashboard;
