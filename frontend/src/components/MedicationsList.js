import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { FaPills } from 'react-icons/fa';
import './MedicationsList.css';

function MedicationsList({ patientId }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMedications = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const userType = localStorage.getItem('userType');

      if (userType === 'patient') {
        const fallback = await apiClient.get(`/health-records/tablets/${patientId}`);
        if (fallback.data) {
          setMedications(fallback.data);
        }
        return;
      }

      // If doctor, try doctor endpoint first
      try {
        const response = await apiClient.get(`/doctors/patient/${patientId}`);
        if (response.data && response.data.tablets) {
          setMedications(response.data.tablets);
          return;
        }
      } catch (e) {
        const orig = e.originalError || e;
        const status = orig?.response?.status;
        if (status === 403 || status === 401) {
          console.warn('Doctor endpoint restricted; falling back to health-records');
        } else {
          console.error('Error fetching from doctor endpoint:', orig || e);
        }
      }

      const fallback = await apiClient.get(`/health-records/tablets/${patientId}`);
      if (fallback.data) {
        setMedications(fallback.data);
      }
    } catch (err) {
      setError('Error loading medications');
      console.error('Error fetching medications:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  if (loading) return <div className="medications-list"><div className="loading">Loading medications...</div></div>;

  return (
    <div className="medications-list">
      <div className="list-header">
        <h3><FaPills /> Prescribed Medications</h3>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {medications.length === 0 ? (
        <div className="no-data">
          <p>No medications prescribed yet</p>
        </div>
      ) : (
        <div className="medications-grid">
          {medications.map((med) => (
            <div key={med._id} className="medication-card">
              <div className="med-card-header">
                <h4>{med.tabletName || med.medicationType || 'Medication'}</h4>
              </div>
              
              <div className="med-card-details">
                {med.dosage && (
                  <p><strong>Dosage:</strong> {med.dosage}</p>
                )}
                
                {med.schedule && med.schedule.length > 0 && (
                  <div className="schedule-info">
                    <strong>Schedule:</strong>
                    <ul>
                      {med.schedule.map((sched, idx) => (
                        <li key={idx}>
                          {typeof sched === 'object' 
                            ? `${sched.day} at ${sched.time}`
                            : sched
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {med.tablets && med.tablets.length > 0 && (
                  <div className="tablets-info">
                    <strong>Tablets ({med.tablets.length}):</strong>
                    <div className="tablets-list">
                      {med.tablets.map((tablet, idx) => (
                        <div key={idx} className="tablet-item">
                          <span className="tablet-name">{tablet.name}</span>
                          <span className="tablet-time">{tablet.time}</span>
                          {tablet.date && (
                            <span className="tablet-date">{new Date(tablet.date).toLocaleDateString()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {med.startDate && med.endDate && (
                  <div className="date-range">
                    <strong>Period:</strong> {new Date(med.startDate).toLocaleDateString()} to {new Date(med.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="med-card-footer">
                <small>Added: {new Date(med.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicationsList;
