import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import io from 'socket.io-client';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './BookedAppointments.css';

function DoctorAppointments({ doctorId, refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionSuccess, setCompletionSuccess] = useState(null);

  const fetchAppointments = async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/appointments/doctor/${doctorId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      const sorted = data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sorted);
    } catch (err) {
      console.error('Error fetching doctor appointments:', err);
      setError('Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, refreshKey]);

  // Listen for realtime updates
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('appointments-updated', (data) => {
      try {
        const did = data?.appointment?.doctorId || data?.doctorId;
        if (!doctorId || !did) {
          fetchAppointments();
          return;
        }
        if (String(did) === String(doctorId)) fetchAppointments();
      } catch (e) {
        fetchAppointments();
      }
    });

    return () => socket.close();
  }, [doctorId]);

  const handleFinish = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      setCompletionSuccess('✓ Appointment completed successfully!');
      setTimeout(() => setCompletionSuccess(null), 4000);
      fetchAppointments();
    } catch (err) {
      console.error('Error marking appointment completed:', err);
      setError('Unable to update appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Unable to cancel appointment');
    }
  };

  if (!doctorId) return null;
  if (loading) return <div className="loading">Loading your appointments...</div>;
  if (error) return <div className="no-data">{error}</div>;

  const activeAppointments = appointments.filter(a => (a.status || 'scheduled') === 'scheduled');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="booked-appointments two-column">
      <h3>📅 Your Appointments</h3>
      
      {completionSuccess && (
        <div className="completion-success-banner">
          {completionSuccess}
        </div>
      )}

      <div className="appointments-split">
        <div className="left-column">
          <h4>Active ({activeAppointments.length})</h4>
          {activeAppointments.length === 0 ? (
            <p className="no-data">No active appointments</p>
          ) : (
            <div className="appointments-list">
              {activeAppointments.map((apt, idx) => (
                <div key={apt._id} className="appointment-card">
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      (apt.patientId && typeof apt.patientId === 'object' && apt.patientId.name) ||
                      'Patient'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> Scheduled</p>
                  </div>
                  <div className="apt-actions">
                    <button
                      className="apt-action finish"
                      title="Mark finished"
                      onClick={() => handleFinish(apt._id)}
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="apt-action cancel"
                      title="Cancel appointment"
                      onClick={() => handleCancel(apt._id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="middle-column">
          <h4>Completed ({completedAppointments.length})</h4>
          {completedAppointments.length === 0 ? (
            <p className="no-data">No completed appointments</p>
          ) : (
            <div className="appointments-list">
              {completedAppointments.map((apt, idx) => (
                <div key={apt._id} className="appointment-card">
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      (apt.patientId && typeof apt.patientId === 'object' && apt.patientId.name) ||
                      'Patient'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> Completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-column">
          <h4>Cancelled ({cancelledAppointments.length})</h4>
          {cancelledAppointments.length === 0 ? (
            <p className="no-data">No cancelled appointments</p>
          ) : (
            <div className="appointments-list">
              {cancelledAppointments.map((apt, idx) => (
                <div key={apt._id} className="appointment-card">
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      (apt.patientId && typeof apt.patientId === 'object' && apt.patientId.name) ||
                      'Patient'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> Cancelled</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointments;
