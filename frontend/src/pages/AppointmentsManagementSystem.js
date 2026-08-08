import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaFilter, FaCheckCircle, FaTimesCircle, FaSync, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import io from 'socket.io-client';
import apiClient from '../utils/api';
import './AppointmentsManagementSystem.css';

function AppointmentsManagementSystem() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  // Define userInfo first
  const userInfo = userType === 'doctor' 
    ? JSON.parse(localStorage.getItem('doctorInfo') || '{}')
    : JSON.parse(localStorage.getItem('patientInfo') || '{}');

  // All hooks must be declared unconditionally first
  const [appointments, setAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    console.log('🔍 Appointment System Debug:');
    console.log('User Type:', userType);
    console.log('User ID:', userInfo._id);
    console.log('User Info:', userInfo);
    console.log('Token:', token ? '✓ Present' : '✗ Missing');
  }, [userType, userInfo]);

  useEffect(() => {
    // Only fetch if authenticated
    if (!token || !userType) {
      console.warn('⚠️ Not authenticated - skipping fetch');
      return;
    }
    fetchAppointments();
    
    // Auto-refresh every 5 seconds when enabled
    const interval = autoRefresh ? setInterval(() => {
      fetchAppointments();
    }, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userType, autoRefresh, token]);

  // Socket.io Real-time Updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('appointments-updated', () => {
      console.log('📨 Real-time update received - refreshing appointments');
      fetchAppointments();
    });

    return () => {
      socket.disconnect();
    };
  }, [userType]);

  // Early return after all hooks
  if (!token || !userType) {
    return (
      <div className="ams-wrapper">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>⚠️ Authentication Required</h2>
          <p>Please log in to view your appointments.</p>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const fetchAppointments = async () => {
    // Validate user info exists (doctors use 'id', patients use '_id')
    const userId = userInfo._id || userInfo.id;
    if (!userInfo || !userId) {
      console.error('❌ Error: User ID not found. User Info:', userInfo);
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      const endpoint = userType === 'doctor' 
        ? `/appointments/doctor/${userId}`
        : `/appointments/patient/${userId}`;
      
      console.log(`📡 Fetching appointments from: ${endpoint}`);
      response = await apiClient.get(endpoint);
      
      console.log('✅ Appointments received:', response.data);
      // Handle both array and object responses
      const appointmentsData = Array.isArray(response.data) ? response.data : response.data.appointments || [];
      setAppointments(appointmentsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      console.error('Error details:', err.response?.data || err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      setSuccessMessage('✓ Appointment marked as completed!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAppointments();
    } catch (err) {
      console.error('Error completing appointment:', err);
      setSuccessMessage('❌ Error completing appointment');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      setSuccessMessage('✗ Appointment cancelled!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setSuccessMessage('❌ Error cancelling appointment');
    }
  };

  const filteredAppointments = selectedStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => {
      if (selectedStatus === 'scheduled') {
        // show only scheduled appointments happening today
        if (apt.status !== 'scheduled') return false;
        try {
          const aptDate = new Date(apt.appointmentDate);
          const today = new Date();
          return aptDate.toDateString() === today.toDateString();
        } catch (e) {
          return false;
        }
      }
      return apt.status === selectedStatus;
    });

  const getStatusClass = (status) => {
    switch(status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const stats = (() => {
    const today = new Date();
    const isToday = (d) => {
      try { return new Date(d).toDateString() === today.toDateString(); } catch (e) { return false; }
    };
    return {
      total: appointments.length,
      // show only today's scheduled appointments in the Scheduled stat
      active: appointments.filter(a => a.status === 'scheduled' && isToday(a.appointmentDate)).length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length
    };
  })();

  return (
    <div className="ams-wrapper">
      {/* Header */}
      <header className="ams-header">
        <div className="ams-header-content">
          <button 
            className="ams-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <div className="ams-title">
            <FaCalendar className="ams-title-icon" />
            <h1>📅 Appointments Management System</h1>
          </div>
          <div className="ams-header-controls">
            <button 
              className="ams-refresh-btn"
              onClick={() => fetchAppointments()}
              title="Refresh now"
            >
              <FaSync /> Refresh
            </button>
            <button 
              className={`ams-auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "Auto-refresh ON (every 5s)" : "Auto-refresh OFF"}
            >
              {autoRefresh ? <FaToggleOn /> : <FaToggleOff />}
            </button>
            <div className="ams-last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <div className="ams-user-badge">
            {userType === 'doctor' ? '👨‍⚕️ Doctor' : '👤 Patient'}
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="ams-success-toast">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {!userInfo._id && !userInfo.id && (
        <div className="ams-error-banner">
          <h3>⚠️ Missing User Information</h3>
          <p>Unable to load appointments. Please log in again.</p>
          <button onClick={() => navigate('/')} className="ams-error-btn">
            Go to Login
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="ams-container">
        {/* Stats Dashboard */}
        <section className="ams-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-card active">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Scheduled</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card cancelled">
            <div className="stat-number">{stats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </section>

        {/* Tabs */}
        <div className="ams-tabs">
          <button 
            className={`ams-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <FaFilter /> List View
          </button>
          <button 
            className={`ams-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <FaCalendar /> Calendar View
          </button>
        </div>

        {/* Filter Section */}
        <section className="ams-filters">
          <h3>Filter by Status</h3>
          <div className="ams-filter-buttons">
            <button 
              className={`ams-filter-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`ams-filter-btn ${selectedStatus === 'scheduled' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('scheduled')}
            >
              Scheduled ({stats.active})
            </button>
            <button 
              className={`ams-filter-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('completed')}
            >
              Completed ({stats.completed})
            </button>
            <button 
              className={`ams-filter-btn ${selectedStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('cancelled')}
            >
              Cancelled ({stats.cancelled})
            </button>
          </div>
        </section>

        {/* List View */}
        {activeTab === 'list' && (
          <section className="ams-appointments-grid">
            {loading ? (
              <div className="ams-loading">
                <div className="ams-spinner"></div>
                <p>Loading appointments...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="ams-appointments-list">
                {filteredAppointments.map((apt) => (
                  <div 
                    key={apt._id} 
                    className={`ams-appointment-card ${getStatusClass(apt.status)}`}
                  >
                    <div className="ams-card-header">
                      <div className="ams-status-badge">{apt.status === 'scheduled' ? 'Scheduled' : getStatusLabel(apt.status)}</div>
                      <div className="ams-card-icons">
                        {apt.status === 'scheduled' && <FaCheckCircle className="icon-check" />}
                        {apt.status === 'completed' && <FaCheckCircle className="icon-completed" />}
                        {apt.status === 'cancelled' && <FaTimesCircle className="icon-cancelled" />}
                      </div>
                    </div>

                    <div className="ams-card-content">
                      {userType === 'doctor' ? (
                        <>
                          <div className="ams-detail">
                            <span className="ams-label">👤 Patient:</span>
                            <span className="ams-value">{apt.patientId?.name || 'Unknown'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">📊 Health ID:</span>
                            <span className="ams-value">{apt.patientId?.healthId || '-'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">📧 Email:</span>
                            <span className="ams-value">{apt.patientId?.email || '-'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ams-detail">
                            <span className="ams-label">👨‍⚕️ Doctor:</span>
                            <span className="ams-value">{apt.doctorId?.name || 'Unknown'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">🏥 Specialty:</span>
                            <span className="ams-value">{apt.doctorId?.speciality || 'General'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">📧 Email:</span>
                            <span className="ams-value">{apt.doctorId?.email || '-'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">🏢 Department:</span>
                            <span className="ams-value">{apt.doctorId?.department || 'General Medical'}</span>
                          </div>
                          <div className="ams-detail">
                            <span className="ams-label">📍 Location:</span>
                            <span className="ams-value">{apt.doctorId?.location || 'Main Clinic'}</span>
                          </div>
                        </>
                      )}

                      <div className="ams-detail">
                        <span className="ams-label">📅 Date:</span>
                        <span className="ams-value">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="ams-detail">
                        <span className="ams-label">🕐 Time:</span>
                        <span className="ams-value">{apt.appointmentTime}</span>
                      </div>

                      <div className="ams-detail">
                        <span className="ams-label">📋 Reason:</span>
                        <span className="ams-value">{apt.reasonForVisit || 'General Checkup'}</span>
                      </div>

                      {apt.notes && (
                        <div className="ams-detail">
                          <span className="ams-label">📝 Notes:</span>
                          <span className="ams-value">{apt.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="ams-card-actions">
                      {apt.status === 'scheduled' && userType === 'doctor' && (
                        <>
                          <button 
                            className="ams-action-btn complete"
                            onClick={() => completeAppointment(apt._id)}
                          >
                            ✓ Complete
                          </button>
                          <button 
                            className="ams-action-btn cancel"
                            onClick={() => cancelAppointment(apt._id)}
                          >
                            ✗ Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'completed' && (
                        <button 
                          className="ams-status-completed"
                          onClick={() => setSelectedAppointment(apt)}
                          title="Click to view details"
                        >
                          ✓ Completed
                        </button>
                      )}
                      {apt.status === 'cancelled' && (
                        <button 
                          className="ams-status-cancelled"
                          onClick={() => setSelectedAppointment(apt)}
                          title="Click to view details"
                        >
                          ✗ Cancelled
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ams-empty">
                <FaCalendar className="ams-empty-icon" />
                <h3>No appointments found</h3>
                <p>You don't have any {selectedStatus === 'all' ? '' : selectedStatus} appointments</p>
                <div className="ams-empty-debug">
                  <small>Status: {selectedStatus} | Total: {appointments.length} | Loading: {loading ? 'Yes' : 'No'}</small>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <section className="ams-calendar-section">
            <div className="ams-calendar-info">
              <FaCalendar className="ams-calendar-icon" />
              <h3>Calendar View</h3>
              <p>Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="ams-appointments-timeline">
              {filteredAppointments
                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                .map((apt, idx) => (
                  <div key={apt._id} className={`ams-timeline-item ${getStatusClass(apt.status)}`}>
                    <div className="ams-timeline-dot"></div>
                    <div className="ams-timeline-content">
                      <div className="ams-timeline-date">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="ams-timeline-time">{apt.appointmentTime}</div>
                      <div className="ams-timeline-info">
                        {userType === 'doctor' 
                          ? `Patient: ${apt.patientId?.name || 'Unknown'}`
                          : `Doctor: ${apt.doctorId?.name || 'Unknown'}`
                        }
                      </div>
                      {userType === 'patient' && apt.doctorId && (
                        <>
                          <div className="ams-timeline-detail">
                            Specialty: {apt.doctorId?.speciality || 'General'}
                          </div>
                          <div className="ams-timeline-detail">
                            Dept: {apt.doctorId?.department || 'Medical'}
                          </div>
                        </>
                      )}
                      <div className="ams-timeline-reason">{apt.reasonForVisit || 'General Checkup'}</div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="ams-footer">
        <p>&copy; 2026 HealthHub - Appointments Management System</p>
      </footer>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="ams-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="ams-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ams-modal-header">
              <h2>Appointment Details</h2>
              <button 
                className="ams-modal-close"
                onClick={() => setSelectedAppointment(null)}
              >
                ✕
              </button>
            </div>

            <div className="ams-modal-body">
              <div className="ams-modal-section">
                <h3>Status</h3>
                <p className={`ams-status-badge ${selectedAppointment.status}`}>
                  {selectedAppointment.status === 'completed' && '✓ Completed'}
                  {selectedAppointment.status === 'cancelled' && '✗ Cancelled'}
                  {selectedAppointment.status === 'scheduled' && '○ Scheduled'}
                </p>
              </div>

              <div className="ams-modal-section">
                <h3>Patient Information</h3>
                <div className="ams-modal-field">
                  <label>Name:</label>
                  <p>{selectedAppointment.patientId?.name || 'Unknown'}</p>
                </div>
                <div className="ams-modal-field">
                  <label>Health ID:</label>
                  <p>{selectedAppointment.patientId?.healthId || '-'}</p>
                </div>
                <div className="ams-modal-field">
                  <label>Email:</label>
                  <p>{selectedAppointment.patientId?.email || '-'}</p>
                </div>
              </div>

              <div className="ams-modal-section">
                <h3>Appointment Details</h3>
                <div className="ams-modal-field">
                  <label>Date:</label>
                  <p>{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div className="ams-modal-field">
                  <label>Time:</label>
                  <p>{selectedAppointment.appointmentTime}</p>
                </div>
                <div className="ams-modal-field">
                  <label>Reason for Visit:</label>
                  <p>{selectedAppointment.reasonForVisit || 'General Checkup'}</p>
                </div>
              </div>

              {userType === 'doctor' && selectedAppointment.doctorId && (
                <div className="ams-modal-section">
                  <h3>Doctor Information</h3>
                  <div className="ams-modal-field">
                    <label>Name:</label>
                    <p>{selectedAppointment.doctorId?.name || 'Unknown'}</p>
                  </div>
                  <div className="ams-modal-field">
                    <label>Email:</label>
                    <p>{selectedAppointment.doctorId?.email || '-'}</p>
                  </div>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="ams-modal-section">
                  <h3>Notes</h3>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="ams-modal-footer">
              <button 
                className="ams-modal-close-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsManagementSystem;
