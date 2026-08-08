import React, { useState } from 'react';
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from '../utils/api';
import './VaccinationManager.css';

function VaccinationManager({ patientId }) {
  const [completedVaccinations, setCompletedVaccinations] = useState([
    { name: '', date: '' }
  ]);
  const [futureVaccinations, setFutureVaccinations] = useState([
    { name: '', date: '' }
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddVaccination = (type) => {
    if (type === 'completed') {
      setCompletedVaccinations([...completedVaccinations, { name: '', date: '' }]);
    } else {
      setFutureVaccinations([...futureVaccinations, { name: '', date: '' }]);
    }
  };

  const handleRemoveVaccination = (type, index) => {
    if (type === 'completed') {
      setCompletedVaccinations(completedVaccinations.filter((_, i) => i !== index));
    } else {
      setFutureVaccinations(futureVaccinations.filter((_, i) => i !== index));
    }
  };

  const handleVaccineChange = (type, index, field, value) => {
    if (type === 'completed') {
      const updated = [...completedVaccinations];
      updated[index][field] = value;
      setCompletedVaccinations(updated);
    } else {
      const updated = [...futureVaccinations];
      updated[index][field] = value;
      setFutureVaccinations(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty entries
      const completedVacs = completedVaccinations.filter(v => v.name && v.date);
      const futureVacs = futureVaccinations.filter(v => v.name && v.date);

      if (completedVacs.length === 0 && futureVacs.length === 0) {
        alert('Please add at least one vaccination with name and date');
        setLoading(false);
        return;
      }

      const vaccinationData = {
        patientId,
        completedVaccinations: completedVacs,
        futureVaccinations: futureVacs
      };

      await apiClient.post('/doctors/vaccination-details', vaccinationData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      // Reset form
      setCompletedVaccinations([{ name: '', date: '' }]);
      setFutureVaccinations([{ name: '', date: '' }]);
    } catch (error) {
      console.error('Error saving vaccination:', error);
      alert('Error saving vaccination: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vaccination-manager">
      <h3>💉 Vaccination Management</h3>

      {submitted && <div className="success-msg">✓ Vaccination records saved successfully</div>}

      <form onSubmit={handleSubmit} className="vac-form">
        {/* Completed Vaccinations */}
        <div className="vac-section">
          <h4>✓ Completed Vaccinations</h4>
          {completedVaccinations.map((vac, idx) => (
            <div key={idx} className="vac-entry">
              <input
                type="text"
                placeholder="Vaccination Name (e.g., COVID-19, Polio)"
                value={vac.name}
                onChange={(e) => handleVaccineChange('completed', idx, 'name', e.target.value)}
              />
              <input
                type="date"
                value={vac.date}
                onChange={(e) => handleVaccineChange('completed', idx, 'date', e.target.value)}
              />
              {completedVaccinations.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveVaccination('completed', idx)}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add-more"
            onClick={() => handleAddVaccination('completed')}
          >
            <FaPlus /> Add Another Vaccination
          </button>
        </div>

        {/* Future Vaccinations */}
        <div className="vac-section">
          <h4>📅 Future Vaccinations</h4>
          {futureVaccinations.map((vac, idx) => (
            <div key={idx} className="vac-entry">
              <input
                type="text"
                placeholder="Vaccination Name"
                value={vac.name}
                onChange={(e) => handleVaccineChange('future', idx, 'name', e.target.value)}
              />
              <input
                type="date"
                value={vac.date}
                onChange={(e) => handleVaccineChange('future', idx, 'date', e.target.value)}
              />
              {futureVaccinations.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveVaccination('future', idx)}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn-add-more"
            onClick={() => handleAddVaccination('future')}
          >
            <FaPlus /> Add Another Vaccination
          </button>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          <FaCheck /> Save Vaccinations
        </button>
      </form>
    </div>
  );
}

export default VaccinationManager;
