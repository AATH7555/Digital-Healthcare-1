import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { FaSyringe } from 'react-icons/fa';
import './VaccinationsList.css';

function PatientVaccinationDoctorStyleView({ patientId }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVaccinations = React.useCallback(async () => {
    try {
      setLoading(true);
      // Fetch from health-records endpoint (patient view of doctor's vaccination data)
      const response = await apiClient.get(`/health-records/vaccinations/${patientId}`);
      
      // Parse the vaccination data
      const vaccinationData = [];
      if (Array.isArray(response.data)) {
        response.data.forEach(doc => {
          vaccinationData.push({
            _id: doc._id,
            completedVaccinations: doc.completedVaccinations || [],
            futureVaccinations: doc.futureVaccinations || []
          });
        });
      } else if (response.data && response.data.vaccinations) {
        response.data.vaccinations.forEach(vac => {
          vaccinationData.push({
            _id: vac._id,
            completedVaccinations: vac.completedVaccinations || [],
            futureVaccinations: vac.futureVaccinations || []
          });
        });
      }
      
      setVaccinations(vaccinationData);
      setError('');
    } catch (err) {
      setError('Error loading vaccinations');
      console.error('Error fetching vaccinations:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  if (loading) return <div className="vaccinations-list"><div className="loading">Loading vaccinations...</div></div>;

  return (
    <div className="vaccinations-list">
      <div className="list-header">
        <h3><FaSyringe /> Vaccination History</h3>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {vaccinations.length === 0 ? (
        <div className="no-data">
          <p>📋 No vaccinations recorded yet</p>
        </div>
      ) : (
        <div className="vaccinations-container">
          {/* Completed Vaccinations */}
          <div className="vac-section">
            <div className="vac-section-header">
              <h4>✅ Completed Vaccinations</h4>
              <span className="vac-count">
                {vaccinations.reduce((count, vac) => count + (vac.completedVaccinations ? vac.completedVaccinations.length : 0), 0)} vaccine(s)
              </span>
            </div>
            <div className="vaccinations-grid">
              {vaccinations.map((vac) => {
                if (vac.completedVaccinations && vac.completedVaccinations.length > 0) {
                  return vac.completedVaccinations.map((completed, idx) => (
                    <div key={`completed-${vac._id}-${idx}`} className="vaccination-card completed">
                      <div className="vac-card-icon">✅</div>
                      <div className="vac-card-header">
                        <h5>{completed.name || 'Vaccination'}</h5>
                        <span className="vac-status-badge completed">✓ Completed</span>
                      </div>
                      <div className="vac-card-body">
                        <div className="vac-detail-row">
                          <span className="vac-label">📅 Date:</span>
                          <span className="vac-value">
                            {completed.date 
                              ? new Date(completed.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                              : 'Not specified'}
                          </span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">⏰ Time:</span>
                          <span className="vac-value">{completed.time || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  ));
                }
                return null;
              })}
              {vaccinations.every(vac => !vac.completedVaccinations || vac.completedVaccinations.length === 0) && (
                <div className="vac-empty">No completed vaccinations</div>
              )}
            </div>
          </div>

          {/* Scheduled Vaccinations */}
          <div className="vac-section">
            <div className="vac-section-header">
              <h4>📅 Scheduled Vaccinations</h4>
              <span className="vac-count">
                {vaccinations.reduce((count, vac) => count + (vac.futureVaccinations ? vac.futureVaccinations.length : 0), 0)} vaccine(s)
              </span>
            </div>
            <div className="vaccinations-grid">
              {vaccinations.map((vac) => {
                if (vac.futureVaccinations && vac.futureVaccinations.length > 0) {
                  return vac.futureVaccinations.map((future, idx) => (
                    <div key={`future-${vac._id}-${idx}`} className="vaccination-card future">
                      <div className="vac-card-icon">📅</div>
                      <div className="vac-card-header">
                        <h5>{future.name || 'Vaccination'}</h5>
                        <span className="vac-status-badge future">📋 Scheduled</span>
                      </div>
                      <div className="vac-card-body">
                        <div className="vac-detail-row">
                          <span className="vac-label">📅 Date:</span>
                          <span className="vac-value">
                            {future.scheduledDate 
                              ? new Date(future.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                              : (future.date
                                ? new Date(future.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Not specified')}
                          </span>
                        </div>
                        <div className="vac-detail-row">
                          <span className="vac-label">⏰ Time:</span>
                          <span className="vac-value">{future.time || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  ));
                }
                return null;
              })}
              {vaccinations.every(vac => !vac.futureVaccinations || vac.futureVaccinations.length === 0) && (
                <div className="vac-empty">No scheduled vaccinations</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientVaccinationDoctorStyleView;
