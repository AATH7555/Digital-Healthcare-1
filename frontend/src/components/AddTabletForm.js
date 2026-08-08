import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './AddTabletForm.css';

function AddTabletForm({ patientId }) {
  const [formData, setFormData] = useState({
    tabletName: '',
    dosage: '',
    schedule: [{ day: 'Monday', time: '08:00' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index][field] = value;
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { day: 'Tuesday', time: '08:00' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/doctors/tablet', {
        patientId,
        tabletName: formData.tabletName,
        dosage: formData.dosage,
        schedule: formData.schedule,
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFormData({
        tabletName: '',
        dosage: '',
        schedule: [{ day: 'Monday', time: '08:00' }],
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    } catch (error) {
      setError('Error submitting medication information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tablet-form">
      {submitted && <div className="success-message">✓ Medication submitted successfully! Data updated for patient.</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Tablet Name</label>
          <input
            type="text"
            value={formData.tabletName}
            onChange={(e) => setFormData({ ...formData, tabletName: e.target.value })}
            placeholder="e.g., Aspirin, Paracetamol"
            required
          />
        </div>
        <div className="form-group">
          <label>Dosage</label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g., 500mg"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="schedule-section">
        <h4>Weekly Schedule</h4>
        {formData.schedule.map((item, index) => (
          <div key={index} className="schedule-item">
            <select
              value={item.day}
              onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
            >
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
              <option>Sunday</option>
            </select>
            <input
              type="time"
              value={item.time}
              onChange={(e) => handleScheduleChange(index, 'time', e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="btn-add-schedule" onClick={handleAddSchedule}>
          + Add Another Day
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={loading}><FaCheck /> {loading ? 'Submitting...' : 'Submit'}</button>
      </div>
    </form>
  );
}

export default AddTabletForm;
