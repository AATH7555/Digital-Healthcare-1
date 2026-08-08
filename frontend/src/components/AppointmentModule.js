import React, { useState } from 'react';
import { FaCalendarAlt, FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './AppointmentModule.css';

function AppointmentModule({ patient, doctors, onBooked }) {
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!patient || !patient._id) {
        alert('Patient information not loaded. Please refresh the page or login again.');
        setLoading(false);
        return;
      }
      await apiClient.post('/appointments', {
        patientId: patient._id,
        ...formData
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: ''
      });
      if (onBooked) onBooked();
    } catch (error) {
      const message = error?.message || error?.originalError?.message || 'Error booking appointment';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointment-module">
      <h3><FaCalendarAlt /> Book Appointment</h3>
      
      {submitted && <div className="success-message">✓ Appointment booked successfully!</div>}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label>Select Doctor</label>
          <select
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            required
          >
            <option value="">-- Choose a doctor --</option>
            {doctors && doctors.map(doc => (
              <option key={doc._id} value={doc._id}>{doc.name} ({doc.specialization})</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Reason for Visit</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe reason for appointment..."
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          <FaCheck /> {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}

export default AppointmentModule;
