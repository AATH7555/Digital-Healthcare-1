import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { FaPills, FaSyringe, FaQrcode, FaSearch, FaSignOutAlt, FaHome, FaUser, FaVideo } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PatientAppointments from '../components/PatientAppointments';
import DoctorAppointments from '../components/DoctorAppointments';
import './DoctorDashboard.css';

function DoctorDashboard({ onLogout }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const doctorId = localStorage.getItem('doctorInfo')
    ? JSON.parse(localStorage.getItem('doctorInfo')).id
    : null;
  const [selectedPatient, setSelectedPatient] = useState(() => {
    // Try to get from location state first, then from localStorage
    const fromStorage = localStorage.getItem('selectedPatient');
    return fromStorage ? JSON.parse(fromStorage) : null;
  });
  const [allPatients, setAllPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Load all patients on component mount
  React.useEffect(() => {
    const loadAllPatients = async () => {
      try {
        const response = await apiClient.get('/doctors/all-patients');
        if (response.data.success) {
          setAllPatients(response.data.patients);
        }
      } catch (err) {
        console.error('Error loading patients:', err);
      } finally {
        setPatientsLoading(false);
      }
    };
    
    loadAllPatients();
  }, []);

  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    // Search in allPatients by name or healthId (case-insensitive, best match first)
    const input = searchInput.trim().toLowerCase();
    const filtered = allPatients.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(input)) ||
        (p.healthId && p.healthId.toLowerCase().includes(input))
    );
    // Sort: exact healthId match first, then name match, then partials
    filtered.sort((a, b) => {
      if (a.healthId && a.healthId.toLowerCase() === input) return -1;
      if (b.healthId && b.healthId.toLowerCase() === input) return 1;
      if (a.name && a.name.toLowerCase() === input) return -1;
      if (b.name && b.name.toLowerCase() === input) return 1;
      return 0;
    });
    setSearchResults(filtered);
    setShowResults(true);
    setSelectedPatient(null);
    setLoading(false);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    setShowResults(false);
  };

  const handleBackToSearch = () => {
    setShowResults(true);
    setSelectedPatient(null);
    localStorage.removeItem('selectedPatient');
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  return (
    <div className="doctor-dashboard">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <FaHome className="brand-icon" />
            <span>{t('doctor_portal')}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> {t('logout')}
          </button>
        </div>
      </nav>

      <div className="doctor-layout">
        <aside className="search-panel">
          <h3>{t('find_patient')}</h3>
          <form onSubmit={handleSearchPatient} className="search-form">
            <div className="form-group">
              <label>{t('name_or_health_id')}</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (!e.target.value.trim()) {
                    setShowResults(false);
                    setSearchResults([]);
                  }
                }}
                placeholder={t('name_or_health_id')}
                autoComplete="off"
              />
            </div>
            <button type="submit" disabled={loading || !searchInput.trim()}>
              <FaSearch /> {loading ? t('searching') : t('search')}
            </button>
          </form>

          <button 
            className="qr-scan-btn nav-button"
            onClick={() => navigate('/doctor/qr-scan')}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaQrcode /> {t('scan_any_patient_qr')}
          </button>

          <button 
            className="action-tab nav-button"
            onClick={() => navigate('/appointments')}
            style={{
              width: '100%',
              marginTop: '10px'
            }}
          >
            📅 {t('appointments')}
          </button>

          <button 
            className="action-tab nav-button"
            onClick={() => navigate('/doctor/meetings')}
            style={{
              width: '100%',
              marginTop: '10px'
            }}
          >
            📹 {t('video_meetings')}
          </button>

          <hr className="separator" />

          {/* Hide all patients list if searching */}
          {!searchInput.trim() && (
            <>
              <h4 className="patients-heading">{t('all_patients')} ({allPatients.length})</h4>
              {patientsLoading ? (
                <div className="loading-text">{t('loading_patients')}</div>
              ) : allPatients.length > 0 ? (
                <div className="quick-access-list">
                  {allPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="quick-access-item"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <div className="quick-access-avatar">{patient.name?.charAt(0)}</div>
                      <div className="quick-access-info">
                        <p className="quick-access-name">{patient.name}</p>
                        <p className="quick-access-id">{patient.healthId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-patients">{t('no_patients')}</div>
              )}
            </>
          )}

          <LanguageSwitcher />
        </aside>

        <main className="doctor-main-content">
          {!selectedPatient && !showResults && doctorId && (
            <div className="doctor-appointments-section">
              <DoctorAppointments doctorId={doctorId} />
            </div>
          )}

          {showResults && searchResults.length > 0 ? (
            <div className="search-results-section">
              <h3>{t('search_results')}</h3>
              <div className="results-list">
                {searchResults.map((patient) => (
                  <div 
                    key={patient._id}
                    className="patient-card"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="patient-card-avatar">{patient.name?.charAt(0)}</div>
                    <div className="patient-card-info">
                      <h4>{patient.name}</h4>
                      <p>{t('health_id')}: {patient.healthId}</p>
                      <p>{patient.email}</p>
                    </div>
                    <span className="view-details-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          ) : showResults && searchResults.length === 0 && searchInput.trim() ? (
            <div className="no-patients">{t('no_matching_patients')}</div>
          ) : selectedPatient ? (
            <div className="patient-details">
              <button className="back-button" onClick={handleBackToSearch}>
                ← {t('back_to_results')}
              </button>
              <div className="patient-header">
                <div className="patient-avatar">{selectedPatient.name?.charAt(0)}</div>
                <div className="patient-info">
                  <h2>{selectedPatient.name}</h2>
                  <p>{t('health_id')}: <strong>{selectedPatient.healthId}</strong></p>
                  <p>{t('email')}: {selectedPatient.email}</p>
                </div>
              </div>
              <div className="action-buttons">
                <AppointmentsTab patient={selectedPatient} t={t} />
                <button 
                  className="action-tab nav-button"
                  onClick={() => navigate(`/doctor/medications/${selectedPatient._id}`)}
                >
                  <FaPills /> {t('medications')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => navigate(`/doctor/manage-medications/${selectedPatient._id}`)}
                >
                  💊 {t('manage_medications')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => navigate(`/doctor/vaccinations/${selectedPatient._id}`)}
                >
                  <FaSyringe /> {t('vaccinations')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => {
                    localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
                    navigate(`/doctor/manage-vaccinations/${selectedPatient._id}`);
                  }}
                >
                  🩹 {t('manage_vaccines')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => navigate(`/doctor/vaccination-view/${selectedPatient._id}`)}
                >
                  💉 {t('vaccination_view')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => {
                    localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
                    navigate(`/doctor/profile/${selectedPatient._id}`);
                  }}
                >
                  <FaUser /> {t('profile')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => {
                    localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
                    navigate(`/doctor/meetings?patientId=${selectedPatient._id}`);
                  }}
                >
                  📹 {t('video_meetings')}
                </button>
                <button 
                  className="action-tab nav-button"
                  onClick={() => {
                    localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
                    navigate(`/doctor/scanner/${selectedPatient._id}`);
                  }}
                >
                  <FaQrcode /> {t('scanner')}
                </button>
              </div>


            </div>
          ) : (
            <div className="empty-state">
              <FaSearch className="empty-icon" />
              <h3>{t('search_for_patient')}</h3>
              <p>{t('name_or_health_id')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


export default DoctorDashboard;


// AppointmentsTab: handles the 📅 Appointments tab and shows appointments when clicked
function AppointmentsTab({ patient, t }) {
  const navigate = useNavigate();
  if (!patient) return null;
  return (
    <button
      className="action-tab nav-button"
      onClick={() => {
        localStorage.setItem('selectedPatient', JSON.stringify(patient));
        navigate(`/doctor/appointments/${patient._id}`);
      }}
    >
      📅 {t('appointments')}
    </button>
  );
}


