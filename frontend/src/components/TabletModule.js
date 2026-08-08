import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaCheck, FaTrash } from 'react-icons/fa';
import apiClient from '../utils/api';
import './TabletModule.css';

function TabletModule({ patient, patientId, initialMedications, onMedicationAdded, onMedicationDeleted, readOnly = false }) {
  const [medications, setMedications] = useState(initialMedications || []);
  const [loading, setLoading] = useState(!initialMedications);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tabletName: '',
    dosage: '',
    frequency: '',
    reason: '',
    schedule: [{ day: 'Monday', time: '08:00' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const actualPatientId = patientId || (patient && patient._id);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/doctors/patient/${actualPatientId}`);
      if (response.data && response.data.tablets) {
        setMedications(response.data.tablets);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  }, [actualPatientId]);

  useEffect(() => {
    if (!initialMedications && actualPatientId) {
      fetchMedications();
    }
  }, [fetchMedications, actualPatientId, initialMedications]);

  const handleAddSchedule = () => {
    setFormData({
      ...formData,
      schedule: [...formData.schedule, { day: 'Tuesday', time: '08:00' }]
    });
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index][field] = value;
    setFormData({ ...formData, schedule: updatedSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMedication = {
        name: formData.tabletName,
        dosage: formData.dosage,
        frequency: formData.frequency,
        reason: formData.reason,
        schedule: formData.schedule,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdAt: new Date()
      };
      
      setMedications([...medications, newMedication]);
      if (onMedicationAdded) {
        onMedicationAdded(newMedication);
      }
      
      alert('✅ Medication added successfully');
      setShowForm(false);
      setFormData({
        tabletName: '',
        dosage: '',
        frequency: '',
        reason: '',
        schedule: [{ day: 'Monday', time: '08:00' }],
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    } catch (error) {
      alert('Error adding medication');
    }
  };

  const handleDeleteMedication = (index) => {
    const deletedMed = medications[index];
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
    if (onMedicationDeleted && deletedMed._id) {
      onMedicationDeleted(deletedMed._id);
    }
    alert('🗑️ Medication deleted successfully');
  };

  return (
    <div className="tablet-module">
      <div className="module-header">
        <h3>💊 Medications</h3>
        {!readOnly && (
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> Add Medication
          </button>
        )}
      </div>

      {showForm && !readOnly && (
        <form onSubmit={handleSubmit} className="tablet-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tablet Name</label>
              <input
                type="text"
                value={formData.tabletName}
                onChange={(e) => setFormData({ ...formData, tabletName: e.target.value })}
                placeholder="e.g., Aspirin, Vitamin D"
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
              <label>Frequency</label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Once daily, Twice daily"
              />
            </div>
            <div className="form-group">
              <label>Reason/Condition</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Headache, Vitamin supplement"
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
            <h4>Schedule</h4>
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
                <button type="submit" className="btn-submit"><FaCheck /> Submit</button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="tablets-list">
        {loading ? (
          <div className="loading-message">Loading medications...</div>
        ) : medications.length === 0 ? (
          <div className="empty-message">📋 No medications prescribed yet</div>
        ) : (
          <div className="medications-grid">
            {medications.map((med, index) => (
              <div key={index} className="medication-card">
                <div className="med-card-header">
                  <h4>{med.name || med.tabletName || 'Medication'}</h4>
                </div>
                
                <div className="med-card-details">
                  {med.dosage && (
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                  )}
                  
                  {med.frequency && (
                    <p><strong>Frequency:</strong> {med.frequency}</p>
                  )}

                  {med.reason && (
                    <p><strong>Reason:</strong> {med.reason}</p>
                  )}
                  
                  {med.schedule && med.schedule.length > 0 && (
                    <div className="schedule-info">
                      <strong>Schedule:</strong>
                      <ul>
                        {med.schedule.map((sched, idx) => (
                          <li key={idx}>{sched.day} - {sched.time}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {med.startDate && med.endDate && (
                    <div className="date-range">
                      <strong>Period:</strong> {new Date(med.startDate).toLocaleDateString()} to {new Date(med.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {!readOnly && (
                  <div className="med-card-actions">
                    <button 
                      className="btn-delete-med"
                      onClick={() => handleDeleteMedication(index)}
                      title="Delete medication"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TabletModule;
