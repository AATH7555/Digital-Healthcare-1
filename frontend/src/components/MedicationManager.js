import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './MedicationManager.css';

function MedicationManager({ patientId }) {
  const [medicationType, setMedicationType] = useState('daily'); // daily or weekly
  const [tabletCount, setTabletCount] = useState(1);
  const [tablets, setTablets] = useState([{ name: '', time: 'morning', date: '' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTabletCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setTabletCount(count);
    const newTablets = Array(count).fill(null).map(() => ({
      name: '',
      time: 'morning',
      date: medicationType === 'daily' ? new Date().toISOString().split('T')[0] : ''
    }));
    setTablets(newTablets);
  };

  const handleTabletChange = (index, field, value) => {
    const newTablets = [...tablets];
    newTablets[index][field] = value;
    setTablets(newTablets);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const medicationData = {
        patientId,
        medicationType: medicationType,
        tablets,
        ...(medicationType === 'weekly' && { startDate, endDate })
      };

      await apiClient.post('/doctors/medication', medicationData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      // Reset form
      setTabletCount(1);
      setTablets([{ name: '', time: 'morning', date: '' }]);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Error saving medication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medication-manager">
      <h3>💊 Medication Management</h3>

      {submitted && <div className="success-msg">✓ Medication saved successfully</div>}

      <form onSubmit={handleSubmit} className="med-form">
        <div className="form-group">
          <label>Medication Type</label>
          <select value={medicationType} onChange={(e) => setMedicationType(e.target.value)}>
            <option value="daily">Daily Medication</option>
            <option value="weekly">Weekly Schedule</option>
          </select>
        </div>

        <div className="form-group">
          <label>Number of Tablets</label>
          <input
            type="number"
            min="1"
            max="10"
            value={tabletCount}
            onChange={handleTabletCountChange}
            required
          />
        </div>

        <div className="tablets-section">
          <h4>Tablet Details</h4>
          {tablets.map((tablet, idx) => (
            <div key={idx} className="tablet-entry">
              <input
                type="text"
                placeholder={`Tablet ${idx + 1} Name`}
                value={tablet.name}
                onChange={(e) => handleTabletChange(idx, 'name', e.target.value)}
                required
              />
              
              <select
                value={tablet.time}
                onChange={(e) => handleTabletChange(idx, 'time', e.target.value)}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>

              {medicationType === 'daily' && (
                <input
                  type="date"
                  value={tablet.date}
                  onChange={(e) => handleTabletChange(idx, 'date', e.target.value)}
                  required
                />
              )}
            </div>
          ))}
        </div>

        {medicationType === 'weekly' && (
          <div className="weekly-section">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="btn-submit" disabled={loading}>
          <FaCheck /> Save Medication
        </button>
      </form>
    </div>
  );
}

export default MedicationManager;
