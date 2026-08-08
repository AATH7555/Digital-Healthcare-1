import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaCheck, FaTrash, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../utils/api';
import './VaccinationModule.css';

function VaccinationModule({ patient, patientId, initialVaccinations, onVaccinationAdded, onVaccinationDeleted }) {
  // Determine if current user is a patient (hide controls for patients)
  const userType = localStorage.getItem('userType') || null;
  const isPatientUser = userType === 'patient';
  
  const [vaccinations, setVaccinations] = useState(initialVaccinations || []);
  const [loading, setLoading] = useState(!initialVaccinations);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vaccinationName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    futureDate: '',
    futureVaccination: ''
  });

  const actualPatientId = patientId || (patient && patient._id);

  const fetchVaccinations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/doctors/patient/${actualPatientId}`);
      if (response.data && response.data.vaccinations) {
        setVaccinations(response.data.vaccinations);
      }
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  }, [actualPatientId]);

  useEffect(() => {
    if (!initialVaccinations && actualPatientId) {
      fetchVaccinations();
    }
  }, [fetchVaccinations, actualPatientId, initialVaccinations]);

  // If patient, don't render this doctor-only component
  if (isPatientUser) {
    return null; // Patients should use PatientVaccinationView instead
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a new vaccination record
      const newVaccination = {
        name: formData.vaccinationName,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        status: 'Completed'
      };
      
      // Simulate adding to list (in real app would save to backend)
      setVaccinations([...vaccinations, newVaccination]);
      if (onVaccinationAdded) {
        onVaccinationAdded(newVaccination);
      }
      
      alert('Vaccination information updated successfully');
      setShowForm(false);
      setFormData({
        vaccinationName: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        location: '',
        futureDate: '',
        futureVaccination: ''
      });
    } catch (error) {
      alert('Error updating vaccination information');
    }
  };

  const handleCompleteVaccination = (index) => {
    const updatedVaccinations = [...vaccinations];
    updatedVaccinations[index].status = 'Completed';
    setVaccinations(updatedVaccinations);
    alert('Vaccination marked as completed');
  };

  const handleDeleteVaccination = (index) => {
    const deletedVaccination = vaccinations[index];
    const updatedVaccinations = vaccinations.filter((_, i) => i !== index);
    setVaccinations(updatedVaccinations);
    if (onVaccinationDeleted && deletedVaccination._id) {
      onVaccinationDeleted(deletedVaccination._id);
    }
    alert('Vaccination deleted successfully');
  };

  return (
    <div className="vaccination-module">
      <div className="module-header">
        <h3>💉 Vaccinations</h3>
        {!isPatientUser && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> Add Vaccination
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="vaccination-form">
          <div className="form-section">
            <h4>Vaccination Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Vaccination Name</label>
                <input
                  type="text"
                  value={formData.vaccinationName}
                  onChange={(e) => setFormData({ ...formData, vaccinationName: e.target.value })}
                  placeholder="e.g., COVID-19, Flu Shot"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Hospital, Clinic"
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
            <h4>Future Vaccination</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Future Vaccination Name</label>
                <input
                  type="text"
                  value={formData.futureVaccination}
                  onChange={(e) => setFormData({ ...formData, futureVaccination: e.target.value })}
                  placeholder="e.g., Booster Dose"
                />
              </div>
              <div className="form-group">
                <label>Scheduled Date (within 7 days)</label>
                <input
                  type="date"
                  value={formData.futureDate}
                  onChange={(e) => setFormData({ ...formData, futureDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit"><FaCheck /> Submit</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="vaccinations-list">
        {loading ? (
          <div className="loading-message">Loading vaccinations...</div>
        ) : vaccinations.length === 0 ? (
          <div className="empty-message">📋 No vaccinations recorded yet</div>
        ) : (
          <div className="vaccinations-container">
            {/* Completed Vaccinations */}
            <div className="vac-section">
              <div className="vac-section-header">
                <h4>✅ Completed Vaccinations</h4>
                <span className="vac-count">
                  {vaccinations.filter(vac => vac.status === 'Completed').length} vaccine(s)
                </span>
              </div>
              <div className="vaccinations-grid">
                {vaccinations
                  .map((vac, idx) => ({ ...vac, originalIndex: idx }))
                  .filter(vac => vac.status === 'Completed')
                  .map((vac) => (
                    <div key={`completed-${vac.originalIndex}`} className="vaccination-card completed">
                      <div className="vac-card-icon">✅</div>
                      <div className="vac-card-header">
                        <h5>{vac.name}</h5>
                        <span className="vac-status-badge completed">✓ Completed</span>
                      </div>
                      <div className="vac-card-body">
                        <div className="vac-detail-row">
                          <span className="vac-label">📅 Date:</span>
                          <span className="vac-value">{new Date(vac.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">⏰ Time:</span>
                          <span className="vac-value">{vac.time || 'Not specified'}</span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">📍 Location:</span>
                          <span className="vac-value">{vac.location || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="vac-card-actions">
                        {!isPatientUser && (
                          <button 
                            className="btn-delete-vac"
                            onClick={() => handleDeleteVaccination(vac.originalIndex)}
                            title="Delete vaccination"
                          >
                            <FaTrash /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {vaccinations.filter(vac => vac.status === 'Completed').length === 0 && (
                  <div className="vac-empty">No completed vaccinations</div>
                )}
              </div>
            </div>

            {/* Pending Vaccinations */}
            <div className="vac-section">
              <div className="vac-section-header">
                <h4>⏳ Pending Vaccinations</h4>
                <span className="vac-count">
                  {vaccinations.filter(vac => vac.status !== 'Completed').length} vaccine(s)
                </span>
              </div>
              <div className="vaccinations-grid">
                {vaccinations
                  .map((vac, idx) => ({ ...vac, originalIndex: idx }))
                  .filter(vac => vac.status !== 'Completed')
                  .map((vac) => (
                    <div key={`pending-${vac.originalIndex}`} className="vaccination-card pending">
                      <div className="vac-card-icon">📅</div>
                      <div className="vac-card-header">
                        <h5>{vac.name}</h5>
                        <span className="vac-status-badge pending">⏳ Pending</span>
                      </div>
                      <div className="vac-card-body">
                        <div className="vac-detail-row">
                          <span className="vac-label">📅 Date:</span>
                          <span className="vac-value">{new Date(vac.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">⏰ Time:</span>
                          <span className="vac-value">{vac.time || 'Not specified'}</span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">📍 Location:</span>
                          <span className="vac-value">{vac.location || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="vac-card-actions">
                        {!isPatientUser && (
                          <>
                            <button 
                              className="btn-complete-vac"
                              onClick={() => handleCompleteVaccination(vac.originalIndex)}
                              title="Mark as completed"
                            >
                              <FaCheckCircle /> Mark Complete
                            </button>
                            <button 
                              className="btn-delete-vac"
                              onClick={() => handleDeleteVaccination(vac.originalIndex)}
                              title="Delete vaccination"
                            >
                              <FaTrash /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                {vaccinations.filter(vac => vac.status !== 'Completed').length === 0 && (
                  <div className="vac-empty">No pending vaccinations</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VaccinationModule;
