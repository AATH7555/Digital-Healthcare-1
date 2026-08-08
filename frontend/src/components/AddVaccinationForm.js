import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './AddVaccinationForm.css';

function AddVaccinationForm({ patientId }) {
  const [formData, setFormData] = useState({
    vaccinationName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    futureDate: '',
    futureVaccination: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const vaccinationDetails = [{
        date: formData.date,
        time: formData.time,
        location: formData.location
      }];

      const futureVaccinations = formData.futureVaccination ? [{
        name: formData.futureVaccination,
        scheduledDate: formData.futureDate
      }] : [];

      await apiClient.post('/doctors/vaccination', {
        patientId,
        vaccinationName: formData.vaccinationName,
        vaccinationDetails,
        futureVaccinations
      });
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({
        vaccinationName: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        futureDate: '',
        futureVaccination: ''
      });
    } catch (error) {
      setError('Error submitting vaccination information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vaccination-form">
      {submitted && <div className="success-message">✓ Vaccination submitted successfully! Data updated for patient.</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="form-section">
        <h4>Vaccination Details</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Vaccination Name</label>
            <input
              type="text"
              value={formData.vaccinationName}
              onChange={(e) => setFormData({ ...formData, vaccinationName: e.target.value })}
              placeholder="e.g., COVID-19, Flu Shot, MMR"
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., General Hospital"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Future Vaccination (within 7 days)</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Vaccination Name</label>
            <input
              type="text"
              value={formData.futureVaccination}
              onChange={(e) => setFormData({ ...formData, futureVaccination: e.target.value })}
              placeholder="e.g., Booster Dose, Follow-up"
            />
          </div>
          <div className="form-group">
            <label>Scheduled Date</label>
            <input
              type="date"
              value={formData.futureDate}
              onChange={(e) => setFormData({ ...formData, futureDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}><FaCheck /> {loading ? 'Submitting...' : 'Submit'}</button>
      </div>
    </form>
  );
}

export default AddVaccinationForm;
