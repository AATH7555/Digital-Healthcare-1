import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaExternalLinkAlt, FaClock, FaCalendarCheck, FaInfoCircle } from 'react-icons/fa';
import apiClient from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import './PatientMeetingsPage.css';

function PatientMeetingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientAndMeetings = async () => {
      try {
        const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || 'null');
        if (patientInfo && patientInfo._id) {
          setPatient(patientInfo);
          await loadMeetings(patientInfo._id);
        } else {
          // Fallback to fetch from backend dashboard info
          const response = await apiClient.get('/patients/dashboard/info');
          if (response.data.patient) {
            setPatient(response.data.patient);
            localStorage.setItem('patientInfo', JSON.stringify(response.data.patient));
            await loadMeetings(response.data.patient._id);
          } else {
            setError('Please login to view meeting links.');
          }
        }
      } catch (err) {
        console.error('Error fetching patient info/meetings:', err);
        setError('Unable to load meeting schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndMeetings();
  }, []);

  const loadMeetings = async (patientId) => {
    const response = await apiClient.get(`/meetings/patient/${patientId}`);
    if (response.data.success) {
      setMeetings(response.data.meetings || []);
    }
  };

  if (loading) {
    return (
      <div className="patient-meetings-page">
        <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
          <FaArrowLeft /> {t('back_to_dashboard')}
        </button>
        <div className="meetings-container loading-state">
          <div className="spinner"></div>
          <p>Fetching scheduled consultations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-meetings-page">
        <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
          <FaArrowLeft /> {t('back_to_dashboard')}
        </button>
        <div className="meetings-container error-state">
          <FaInfoCircle className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-meetings-page">
      <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
        <FaArrowLeft /> {t('back_to_dashboard')}
      </button>
      
      <div className="meetings-container">
        <div className="meetings-header">
          <div className="meetings-header-title">
            <FaVideo className="icon-video-main" />
            <h1>{t('doctor_meet')}</h1>
          </div>
          <p className="subtitle">Join video consultations with your doctors in one click.</p>
        </div>

        {meetings.length === 0 ? (
          <div className="empty-meetings-card">
            <FaCalendarCheck className="empty-icon" />
            <h3>No Scheduled Video Meetings</h3>
            <p>You do not have any upcoming video appointments scheduled at this time.</p>
            <small>If you need a new appointment, go to the Appointments section to schedule one.</small>
          </div>
        ) : (
          <div className="meetings-list">
            {meetings.map((meet) => {
              const meetDateObj = new Date(meet.meetDate);
              const isToday = meetDateObj.toDateString() === new Date().toDateString();

              return (
                <div key={meet._id} className={`meeting-card ${isToday ? 'highlighted' : ''}`}>
                  {isToday && <div className="today-badge">TODAY</div>}
                  <div className="meeting-card-body">
                    <div className="doctor-info-section">
                      <div className="doctor-avatar">
                        {meet.doctorId?.name?.charAt(0) || 'D'}
                      </div>
                      <div className="doctor-text">
                        <h3>{meet.doctorId?.name || 'Doctor'}</h3>
                        <p className="specialty">{meet.doctorId?.specialization || 'General Practitioner'}</p>
                        {meet.doctorId?.department && (
                          <p className="dept-loc">{meet.doctorId.department} • {meet.doctorId.location || 'Main Clinic'}</p>
                        )}
                      </div>
                    </div>

                    <div className="meeting-time-section">
                      <div className="time-item">
                        <span className="label">Date</span>
                        <span className="value">
                          {meetDateObj.toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="time-item">
                        <span className="label">Time</span>
                        <span className="value clock-value">
                          <FaClock /> {meet.meetTime}
                        </span>
                      </div>
                    </div>

                    {meet.notes && (
                      <div className="meeting-notes-section">
                        <strong>Doctor Notes:</strong> {meet.notes}
                      </div>
                    )}

                    <div className="meeting-action-section">
                      <a 
                        href={meet.meetLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="join-call-btn"
                      >
                        Join Google Meet <FaExternalLinkAlt />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientMeetingsPage;
