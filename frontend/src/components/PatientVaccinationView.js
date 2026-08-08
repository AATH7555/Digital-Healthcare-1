import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { FaSyringe } from 'react-icons/fa';
import './DoctorVaccinationView.css';

function PatientVaccinationView({ patient }) {
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [scheduledVaccinations, setScheduledVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch vaccinations from doctor endpoint (read-only for patients)
  const fetchVaccinations = React.useCallback(async () => {
    try {
      setLoading(true);
      let data = null;

      const userType = localStorage.getItem('userType');

      if (userType === 'patient') {
        const fallback = await apiClient.get(`/health-records/vaccinations/${patient._id}`);
        data = Array.isArray(fallback.data) ? fallback.data : (fallback.data?.vaccinations || []);
      } else {
        // Try doctor endpoint first (preferred source of truth)
        try {
          const response = await apiClient.get(`/doctors/patient/${patient._id}`);
          data = response.data?.vaccinations;
        } catch (e) {
          // The api client may wrap the axios error in { message, originalError }
          const orig = e.originalError || e;
          const status = orig?.response?.status;
          // If access denied or other auth issue, fallback to public health-records endpoint
          if (status === 401 || status === 403) {
            console.warn('Doctor vaccination endpoint restricted; falling back to health-records');
          } else {
            console.error('Error fetching from doctor endpoint:', orig || e);
          }
        }

        if (!data) {
          // Fallback to health-records endpoint
          const fallback = await apiClient.get(`/health-records/vaccinations/${patient._id}`);
          data = Array.isArray(fallback.data) ? fallback.data : (fallback.data?.vaccinations || []);
        }
      }

      // Normalize data into completed and scheduled arrays
      const completed = [];
      const scheduled = [];

      if (Array.isArray(data)) {
        data.forEach(vac => {
          if (vac.completedVaccinations && Array.isArray(vac.completedVaccinations)) {
            completed.push(...vac.completedVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
          if (vac.futureVaccinations && Array.isArray(vac.futureVaccinations)) {
            scheduled.push(...vac.futureVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
        });
      } else if (data && typeof data === 'object') {
        const doc = data;
        if (doc.completedVaccinations) {
          completed.push(...(doc.completedVaccinations || []).map(v => ({ ...v, _id: v._id || Math.random() })));
        }
        if (doc.futureVaccinations) {
          scheduled.push(...(doc.futureVaccinations || []).map(v => ({ ...v, _id: v._id || Math.random() })));
        }
      }

      // Sort completed vaccinations by date (oldest first)
      completed.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateA - dateB;
      });

      // Sort scheduled vaccinations by date (earliest first)
      scheduled.sort((a, b) => {
        const dateA = new Date(a.scheduledDate || 0).getTime();
        const dateB = new Date(b.scheduledDate || 0).getTime();
        return dateA - dateB;
      });

      setCompletedVaccinations(completed);
      setScheduledVaccinations(scheduled);
      setError('');
    } catch (err) {
      console.error('Error fetching vaccinations:', err);
      // Support both shapes: the axios error or the apiClient-wrapped shape { message, originalError }
      const orig = err.originalError || err;
      const serverMessage = orig?.response?.data?.error || orig?.response?.data?.message || err?.message || orig?.message;
      setError(serverMessage || 'Error loading vaccinations');
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  useEffect(() => {
    if (patient && patient._id) {
      fetchVaccinations();
    }
  }, [fetchVaccinations, patient]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="doctor-vac-view"><div className="loading">Loading vaccinations...</div></div>;
  }

  return (
    <div className="doctor-vac-view">
      <div className="vac-view-header">
        <h3><FaSyringe /> My Vaccinations (Doctor Records)</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Completed Vaccinations Section */}
      <div className="vac-section">
        <h4 className="section-title">✅ Completed Vaccinations ({completedVaccinations.length})</h4>
        {completedVaccinations.length === 0 ? (
          <div className="empty-state">No completed vaccinations recorded</div>
        ) : (
          <div className="vac-table">
            <div className="table-header">
              <div className="col-name">Vaccination Name</div>
              <div className="col-date">Date</div>
            </div>
            {completedVaccinations.map((vac, idx) => (
              <div key={idx} className="table-row read-only">
                <div className="col-name">{vac.name}</div>
                <div className="col-date">{formatDate(vac.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Vaccinations Section */}
      <div className="vac-section">
        <h4 className="section-title">📅 Scheduled Vaccinations ({scheduledVaccinations.length})</h4>
        {scheduledVaccinations.length === 0 ? (
          <div className="empty-state">No scheduled vaccinations recorded</div>
        ) : (
          <div className="vac-table">
            <div className="table-header">
              <div className="col-name">Vaccination Name</div>
              <div className="col-date">Scheduled Date</div>
            </div>
            {scheduledVaccinations.map((vac, idx) => (
              <div key={idx} className="table-row read-only">
                <div className="col-name">{vac.name}</div>
                <div className="col-date">{formatDate(vac.scheduledDate || vac.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientVaccinationView;
