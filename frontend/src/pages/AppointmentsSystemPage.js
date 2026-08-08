import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import { FaArrowLeft, FaCheck, FaTimes, FaCalendar, FaUser, FaClock, FaTrash } from 'react-icons/fa';
import '../components/BookedAppointments.css';
import './AppointmentsSystemPage.css';

function AppointmentsSystemPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const userType = localStorage.getItem('userType');
  const doctorInfo = localStorage.getItem('doctorInfo');
  const patientInfo = localStorage.getItem('patientInfo');
  const parsedDoctorInfo = doctorInfo ? JSON.parse(doctorInfo) : null;
  const parsedPatientInfo = patientInfo ? JSON.parse(patientInfo) : null;
  const userId = userType === 'doctor' 
    ? (parsedDoctorInfo ? (parsedDoctorInfo.id || parsedDoctorInfo._id) : null)
    : (parsedPatientInfo ? (parsedPatientInfo._id || parsedPatientInfo.id) : null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (userType === 'doctor' && userId) {
        res = await apiClient.get(`/appointments/doctor/${userId}`);
      } else if (userType === 'patient' && userId) {
        res = await apiClient.get(`/appointments/patient/${userId}`);
      } else {
        setError('Unable to fetch appointments');
        setLoading(false);
        return;
      }

      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      const sorted = data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sorted);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      setSuccessMessage('✓ Appointment marked as completed!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchAppointments();
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Unable to update appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      setSuccessMessage('✓ Appointment cancelled!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Unable to cancel appointment');
    }
  };

  const getFilteredAppointments = () => {
    if (filterStatus === 'all') return appointments;
    if (filterStatus === 'active') return appointments.filter(a => !a.status || a.status === 'scheduled');
    if (filterStatus === 'completed') return appointments.filter(a => a.status === 'completed');
    if (filterStatus === 'cancelled') return appointments.filter(a => a.status === 'cancelled');
    return appointments;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="appointments-system-page">
      <header className="appointments-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>📅 Appointments Management System</h1>
        <div className="header-spacer"></div>
      </header>

      <div className="appointments-container">
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="filter-section">
          <h3>Filter by Status</h3>
          <div className="filter-buttons">
            {['all', 'active', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
                {status === 'all' && `(${appointments.length})`}
                {status === 'active' && `(${appointments.filter(a => !a.status || a.status === 'scheduled').length})`}
                {status === 'completed' && `(${appointments.filter(a => a.status === 'completed').length})`}
                {status === 'cancelled' && `(${appointments.filter(a => a.status === 'cancelled').length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <FaCalendar className="empty-icon" />
            <h3>No appointments found</h3>
            <p>There are no {filterStatus === 'all' ? '' : filterStatus} appointments to display.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((apt, idx) => (
              <div key={apt._id} className="appointment-item">
                <div className="appointment-number">{idx + 1}</div>
                
                <div className="appointment-content">
                  <div className="apt-header">
                    <h3>
                      {userType === 'doctor' 
                        ? apt.patientId?.name || 'Patient' 
                        : apt.doctorId?.name || 'Doctor'}
                    </h3>
                    <span className={`status-badge ${apt.status || 'scheduled'}`}>
                      {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Scheduled'}
                    </span>
                  </div>

                  <div className="apt-details">
                    <div className="detail-row">
                      <FaCalendar className="detail-icon" />
                      <span><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <FaClock className="detail-icon" />
                      <span><strong>Time:</strong> {apt.appointmentTime}</span>
                    </div>
                    <div className="detail-row">
                      <FaUser className="detail-icon" />
                      <span><strong>Reason:</strong> {apt.reason}</span>
                    </div>
                  </div>

                  <div className="appointment-actions">
                    {(!apt.status || apt.status === 'scheduled') && userType === 'doctor' && (
                      <>
                        <button
                          className="action-btn complete-btn"
                          onClick={() => handleCompleteAppointment(apt._id)}
                          title="Mark as completed"
                        >
                          <FaCheck /> Complete
                        </button>
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => handleCancelAppointment(apt._id)}
                          title="Cancel appointment"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </>
                    )}
                    {apt.status !== 'completed' && userType === 'patient' && (
                      <button
                        className="action-btn cancel-btn"
                        onClick={() => handleCancelAppointment(apt._id)}
                        title="Cancel appointment"
                      >
                        <FaTrash /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsSystemPage;
