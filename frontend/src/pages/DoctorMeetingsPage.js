import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaVideo, FaTrashAlt, FaCalendarAlt, FaClock, FaLink, FaUser, FaRegCommentDots } from 'react-icons/fa';
import apiClient from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import './DoctorMeetingsPage.css';

function DoctorMeetingsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdParam = queryParams.get('patientId');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [meetings, setMeetings] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId: patientIdParam || '',
    doctorId: '',
    meetLink: '',
    meetDate: '',
    meetTime: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const doctorInfo = localStorage.getItem('doctorInfo')
    ? JSON.parse(localStorage.getItem('doctorInfo'))
    : null;
  const currentDoctorId = doctorInfo ? doctorInfo.id : 'doctor-1';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetchLoading(true);
    try {
      // Fetch patients
      const patientsResponse = await apiClient.get('/doctors/all-patients');
      if (patientsResponse.data.success) {
        setPatients(patientsResponse.data.patients || []);
      }

      // Fetch doctors
      const doctorsResponse = await apiClient.get('/doctors');
      const docs = doctorsResponse.data || [];
      setDoctors(docs);

      // Pre-select doctor if we have any
      if (docs.length > 0) {
        setFormData(prev => ({ ...prev, doctorId: docs[0]._id }));
      }

      // Fetch scheduled meetings
      await fetchMeetings();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      showMessage('Failed to load page data. Please refresh.', 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await apiClient.get(`/meetings/doctor/${currentDoctorId}`);
      if (response.data.success) {
        setMeetings(response.data.meetings || []);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.meetLink || !formData.meetDate || !formData.meetTime) {
      showMessage('All required fields must be filled', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/meetings', formData);
      if (response.data.success) {
        showMessage('Meeting scheduled and meet link uploaded successfully!', 'success');
        // Reset form but keep selected doctor
        setFormData({
          patientId: '',
          doctorId: doctors.length > 0 ? doctors[0]._id : '',
          meetLink: '',
          meetDate: '',
          meetTime: '',
          notes: ''
        });
        // Refresh meetings list
        fetchMeetings();
      }
    } catch (err) {
      const errorMsg = err.message || 'Error scheduling meeting';
      showMessage(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled meeting?')) return;

    try {
      const response = await apiClient.delete(`/meetings/${meetingId}`);
      if (response.data.success) {
        showMessage('Meeting cancelled successfully.', 'success');
        fetchMeetings();
      }
    } catch (err) {
      showMessage(err.message || 'Error deleting meeting', 'error');
    }
  };

  const handleBack = () => {
    // If a patient was pre-selected, go back to DoctorDashboard with that patient selected
    const selectedPatient = patients.find(p => p._id === patientIdParam);
    if (selectedPatient) {
      localStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
      navigate('/doctor-dashboard');
    } else {
      navigate('/doctor-dashboard');
    }
  };

  return (
    <div className="meetings-management-page">
      <header className="page-header">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <div className="header-title">
          <FaVideo className="video-icon" />
          <h1>{t('video_meetings')}</h1>
        </div>
      </header>

      {message.text && (
        <div className={`status-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {fetchLoading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading Video Meetings module...</p>
        </div>
      ) : (
        <div className="meetings-grid-layout">
          {/* Schedule Meeting Form */}
          <section className="form-card glass-panel">
            <h2>📅 {t('schedule_meeting')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><FaUser /> Select Patient *</label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.healthId})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>👨‍⚕️ Assigned Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaCalendarAlt /> Date *</label>
                  <input
                    type="date"
                    value={formData.meetDate}
                    onChange={(e) => setFormData({ ...formData, meetDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FaClock /> Time *</label>
                  <input
                    type="time"
                    value={formData.meetTime}
                    onChange={(e) => setFormData({ ...formData, meetTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FaLink /> Google Meet Link *</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={formData.meetLink}
                  onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label><FaRegCommentDots /> Notes / Reason (Optional)</label>
                <textarea
                  placeholder="E.g., Follow-up consultation regarding blood pressure readings..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <button type="submit" disabled={loading} className="schedule-btn">
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </form>
          </section>

          {/* Scheduled Meetings List */}
          <section className="list-card glass-panel">
            <h2>📹 Scheduled Video Consultations ({meetings.length})</h2>
            {meetings.length === 0 ? (
              <div className="empty-list-state">
                <FaVideo className="empty-icon" />
                <p>No video meetings currently scheduled.</p>
                <small>Use the form on the left to schedule a new Google Meet session.</small>
              </div>
            ) : (
              <div className="meetings-list-container">
                {meetings.map((meet) => (
                  <div key={meet._id} className="meet-card-item">
                    <div className="meet-header">
                      <div className="meet-badge">Scheduled</div>
                      <button 
                        className="delete-meet-btn" 
                        onClick={() => handleDelete(meet._id)}
                        title="Cancel Meeting"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                    
                    <div className="meet-details-info">
                      <h4>Patient: <strong>{meet.patientId?.name || 'Unknown'}</strong></h4>
                      <p className="meet-health-id">Health ID: {meet.patientId?.healthId || 'N/A'}</p>
                      
                      <div className="details-row">
                        <span><strong>Doctor:</strong> {meet.doctorId?.name || 'Assigned'}</span>
                      </div>
                      
                      <div className="details-row">
                        <span><strong>Date:</strong> {new Date(meet.meetDate).toLocaleDateString()}</span>
                        <span className="time-badge"><FaClock /> {meet.meetTime}</span>
                      </div>

                      <div className="meet-url-box">
                        <FaLink className="url-icon" />
                        <a href={meet.meetLink} target="_blank" rel="noopener noreferrer" className="meet-url-link">
                          {meet.meetLink}
                        </a>
                      </div>

                      {meet.notes && (
                        <div className="meet-notes">
                          <strong>Notes:</strong> {meet.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default DoctorMeetingsPage;
