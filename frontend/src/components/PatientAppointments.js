import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import io from 'socket.io-client';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './BookedAppointments.css';

function PatientAppointments({ patientId, refreshKey, view = 'new', doctors = [], readOnly = false }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completionSuccess, setCompletionSuccess] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // fetchAppointments is exposed so other handlers can refresh the list after updates
  const fetchAppointments = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/appointments/patient/${patientId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      const sorted = data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sorted);
      return sorted;
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
      setError('Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // refresh when parent signals a change
  }, [patientId, refreshKey]);

  // Listen for realtime updates and refresh when relevant
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('appointments-updated', (data) => {
      try {
        const pid = data?.appointment?.patientId || data?.patientId;
        if (!patientId || !pid) {
          fetchAppointments();
          return;
        }
        // compare as strings
        if (String(pid) === String(patientId)) fetchAppointments();
      } catch (e) {
        fetchAppointments();
      }
    });

    return () => socket.close();
  }, [patientId]);

  const handleFinish = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      // Show success message
      setCompletionSuccess('✓ Appointment completed successfully!');
      setTimeout(() => setCompletionSuccess(null), 4000);
      // refresh list
      const updated = await fetchAppointments();
      const completed = (updated || appointments).find(a => String(a._id) === String(appointmentId)) || null;
      if (completed) setSelectedAppointment(completed);
    } catch (err) {
      console.error('Error marking appointment completed:', err);
      setError('Unable to update appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      // prefer updating status to 'cancelled' to keep record
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError('Unable to cancel appointment');
    }
  };

  if (!patientId) return null;
  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="no-data">{error}</div>;

  const activeAppointments = appointments.filter(a => (a.status || 'scheduled') === 'scheduled');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');

  return (
    <>
    <div className="booked-appointments two-column">
      <h3>📅 Appointments for Patient</h3>
      
      {completionSuccess && (
        <div className="completion-success-banner">
          {completionSuccess}
        </div>
      )}

      <div className="appointments-split">
        <div className="left-column">
          <h4>New / Active</h4>
          {activeAppointments.length === 0 ? (
            <p className="no-data">No new or active appointments</p>
          ) : (
            <div className="appointments-list">
              {activeAppointments.map((apt, idx) => (
                <div key={apt._id} className="appointment-card">
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      // if doctor is populated use its name, otherwise try to resolve from passed doctors list
                      (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) ||
                      (doctors && doctors.find(d => String(d._id) === String(apt.doctorId))?.name) ||
                      'Doctor'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> {apt.status || 'Scheduled'}</p>
                  </div>
                  {!readOnly && (
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-column">
          <h4>Completed</h4>
          {completedAppointments.length === 0 ? (
            <p className="no-data">No completed appointments</p>
          ) : (
            <div className="appointments-list">
              {completedAppointments.map((apt, idx) => (
                <div
                  key={apt._id}
                  className="appointment-card"
                  onClick={() => setSelectedAppointment(apt)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) ||
                      (doctors && doctors.find(d => String(d._id) === String(apt.doctorId))?.name) ||
                      'Doctor'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> {apt.status || 'completed'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h4 style={{ marginTop: 18 }}>Cancelled</h4>
          {cancelledAppointments.length === 0 ? (
            <p className="no-data">No cancelled appointments</p>
          ) : (
            <div className="appointments-list">
              {cancelledAppointments.map((apt, idx) => (
                <div key={apt._id} className="appointment-card">
                  <div className="apt-number">{idx + 1}</div>
                  <div className="apt-details">
                    <h4>{
                      (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) ||
                      (doctors && doctors.find(d => String(d._id) === String(apt.doctorId))?.name) ||
                      'Doctor'
                    }</h4>
                    <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {apt.appointmentTime}</p>
                    <p><strong>Reason:</strong> {apt.reason}</p>
                    <p><strong>Status:</strong> {apt.status || 'cancelled'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
      {/* Completed appointment details modal */}
      {selectedAppointment && (
        <div className="apt-modal-overlay" onClick={() => setSelectedAppointment(null)}>
          <div className="apt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="apt-modal-header">
              <h3>Completed Appointment Details</h3>
              <button className="apt-action delete" onClick={() => setSelectedAppointment(null)}>Close</button>
            </div>
            <div className="apt-modal-body">
              <p><strong>Doctor:</strong> {(
                (selectedAppointment.doctorId && typeof selectedAppointment.doctorId === 'object' && selectedAppointment.doctorId.name) ||
                (doctors && doctors.find(d => String(d._id) === String(selectedAppointment.doctorId))?.name) ||
                'Doctor')}
              </p>
              <p><strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
              <p><strong>Reason:</strong> {selectedAppointment.reason}</p>
              <p><strong>Notes:</strong> {selectedAppointment.notes || '—'}</p>
              <p><strong>Status:</strong> {selectedAppointment.status}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PatientAppointments;
