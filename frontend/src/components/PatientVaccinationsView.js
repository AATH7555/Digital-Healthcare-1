import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import './VaccinationModule.css';

function PatientVaccinationsView({ patient }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVaccinations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/health-records/vaccinations/${patient._id}`);
      if (response.data) {
        const raw = response.data;
        const list = [];
        if (Array.isArray(raw)) {
          raw.forEach(doc => {
            // completedVaccinations entries
            if (doc.completedVaccinations && Array.isArray(doc.completedVaccinations)) {
              doc.completedVaccinations.forEach(v => {
                list.push({
                  name: v.name,
                  date: v.date,
                  dose: v.dose,
                  batchNumber: v.batchNumber,
                  nextDue: v.nextDue,
                  notes: v.notes,
                  status: 'Completed'
                });
              });
            }

            // future/scheduled vaccinations
            if (doc.futureVaccinations && Array.isArray(doc.futureVaccinations)) {
              doc.futureVaccinations.forEach(v => {
                list.push({
                  name: v.name,
                  nextDue: v.scheduledDate || v.nextDue || v.date,
                  notes: v.notes,
                  status: 'Scheduled'
                });
              });
            }

            // legacy top-level vaccination document
            if (doc.vaccinationName) {
              list.push({
                name: doc.vaccinationName,
                date: doc.vaccinationDetails?.[0]?.date || doc.date,
                status: doc.status || 'Pending'
              });
            }
          });
        } else if (raw && typeof raw === 'object') {
          // single document
          const doc = raw;
          if (doc.completedVaccinations) {
            doc.completedVaccinations.forEach(v => list.push({ name: v.name, date: v.date, status: 'Completed' }));
          }
        }

        setVaccinations(list);
      }
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  useEffect(() => {
    if (patient && patient._id) {
      fetchVaccinations();
    }
  }, [fetchVaccinations, patient]);

  if (loading) {
    return <div className="vaccination-module"><p>Loading vaccinations...</p></div>;
  }

  return (
    <div className="vaccination-module">
      <div className="module-header">
        <h3>💉 My Vaccinations</h3>
        <p className="view-only-badge">View Only</p>
      </div>

      {vaccinations && vaccinations.length > 0 ? (
        <div className="vaccinations-list">
          {vaccinations.map((vac, index) => (
            <div key={index} className="vaccination-card">
              <div className="vac-header">
                <h4>{vac.name}</h4>
                <span className={`status-badge ${vac.status?.toLowerCase()}`}>
                  {vac.status || 'Pending'}
                </span>
              </div>
              <div className="vac-details">
                {vac.date && (
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(vac.date).toLocaleDateString()}</span>
                  </div>
                )}
                {vac.dose && (
                  <div className="detail-row">
                    <span className="label">Dose:</span>
                    <span className="value">{vac.dose}</span>
                  </div>
                )}
                {vac.batchNumber && (
                  <div className="detail-row">
                    <span className="label">Batch Number:</span>
                    <span className="value">{vac.batchNumber}</span>
                  </div>
                )}
                {vac.nextDue && (
                  <div className="detail-row">
                    <span className="label">Next Due:</span>
                    <span className="value">{new Date(vac.nextDue).toLocaleDateString()}</span>
                  </div>
                )}
                {vac.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{vac.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">
          <p>No vaccinations recorded</p>
        </div>
      )}

      <div className="info-box">
        <p>💡 To add or modify vaccinations, please contact your doctor.</p>
      </div>
    </div>
  );
}

export default PatientVaccinationsView;
