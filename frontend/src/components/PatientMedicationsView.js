import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import './TabletModule.css';

function PatientMedicationsView({ patient }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/health-records/tablets/${patient._id}`);
      if (response.data) {
        const raw = response.data;
        const meds = [];
        if (Array.isArray(raw)) {
          raw.forEach(doc => {
            // new-format: multiple tablets inside a document
            if (doc.tablets && Array.isArray(doc.tablets) && doc.tablets.length > 0) {
              doc.tablets.forEach(t => {
                meds.push({
                  name: t.name || doc.tabletName,
                  dosage: doc.dosage || t.dosage,
                  frequency: doc.medicationType === 'daily' ? 'Daily' : (doc.medicationType === 'weekly' ? 'Weekly' : ''),
                  startDate: t.date || doc.startDate,
                  endDate: doc.endDate,
                  status: doc.status || 'Active',
                  reason: doc.reason || '',
                  fullData: doc
                });
              });
            } else if (doc.tabletName) {
              // legacy single tablet document
              meds.push({
                name: doc.tabletName,
                dosage: doc.dosage,
                frequency: doc.schedule ? 'Custom' : '',
                startDate: doc.startDate,
                endDate: doc.endDate,
                status: doc.status || 'Active',
                reason: doc.reason || '',
                fullData: doc
              });
            }
          });
        } else if (raw && typeof raw === 'object') {
          const doc = raw;
          if (doc.tablets) {
            doc.tablets.forEach(t => meds.push({ name: t.name, dosage: doc.dosage, startDate: t.date, fullData: doc }));
          }
        }

        setMedications(meds);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  useEffect(() => {
    if (patient && patient._id) {
      fetchMedications();
    }
  }, [fetchMedications, patient]);

  if (loading) {
    return <div className="tablet-module"><p>Loading medications...</p></div>;
  }

  return (
    <div className="tablet-module">
      <div className="module-header">
        <h3>💊 My Medications</h3>
        <p className="view-only-badge">View Only</p>
      </div>

      {medications && medications.length > 0 ? (
        <div className="medications-list">
          {medications.map((med, index) => {
            const fullMedData = med.fullData;

            return (
              <div key={index} className="medication-card">
                <div className="med-header">
                  <h4>{med.name}</h4>
                  <span className="status-badge">{med.status || 'Active'}</span>
                </div>
                <div className="med-details">
                  {med.dosage && (
                    <div className="detail-row">
                      <span className="label">Dosage:</span>
                      <span className="value">{med.dosage}</span>
                    </div>
                  )}
                  {med.frequency && (
                    <div className="detail-row">
                      <span className="label">Frequency:</span>
                      <span className="value">{med.frequency}</span>
                    </div>
                  )}
                  
                  {fullMedData && fullMedData.schedule && fullMedData.schedule.length > 0 && (
                    <div className="schedule-info">
                      <strong>Schedule:</strong>
                      <ul>
                        {fullMedData.schedule.map((sched, idx) => (
                          <li key={idx}>{sched}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {fullMedData && fullMedData.tablets && fullMedData.tablets.length > 0 && (
                    <div className="tablets-info">
                      <strong>Tablets ({fullMedData.tablets.length}):</strong>
                      <div className="tablets-list">
                        {fullMedData.tablets.map((tablet, idx) => (
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

                  {med.reason && (
                    <div className="detail-row">
                      <span className="label">Reason:</span>
                      <span className="value">{med.reason}</span>
                    </div>
                  )}
                  {med.startDate && (
                    <div className="detail-row">
                      <span className="label">Started:</span>
                      <span className="value">{new Date(med.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {med.endDate && (
                    <div className="detail-row">
                      <span className="label">Ends:</span>
                      <span className="value">{new Date(med.endDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {fullMedData && fullMedData.startDate && fullMedData.endDate && (
                    <div className="date-range">
                      <strong>Period:</strong> {new Date(fullMedData.startDate).toLocaleDateString()} to {new Date(fullMedData.endDate).toLocaleDateString()}
                    </div>
                  )}

                  {fullMedData && fullMedData.createdAt && (
                    <div className="med-card-footer">
                      <small>Added: {new Date(fullMedData.createdAt).toLocaleDateString()}</small>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-data">
          <p>No medications recorded</p>
        </div>
      )}

      <div className="info-box">
        <p>💡 To modify your medications, please contact your doctor.</p>
      </div>
    </div>
  );
}

export default PatientMedicationsView;
