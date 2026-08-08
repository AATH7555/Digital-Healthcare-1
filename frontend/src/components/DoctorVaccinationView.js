
import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { FaSyringe, FaPlus, FaEdit, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import './DoctorVaccinationView.css';

function DoctorVaccinationView({ patientId, onRefresh, readOnly = false }) {
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [scheduledVaccinations, setScheduledVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    type: 'completed',
    name: '',
    date: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Mark scheduled vaccination as completed
  const handleMarkAsCompleted = async (index) => {
    try {
      // Basic validation
      if (!scheduledVaccinations || index < 0 || index >= scheduledVaccinations.length) {
        alert('Selected vaccination not found. Please refresh and try again.');
        return;
      }

      const vacToComplete = scheduledVaccinations[index];
      if (!vacToComplete || !vacToComplete.name) {
        alert('Invalid vaccination entry. Please check the scheduled vaccination details.');
        return;
      }

      const userType = localStorage.getItem('userType') || null;
      const isPatient = userType === 'patient';

      // Prepare updated lists ensuring valid dates
      const updatedScheduled = scheduledVaccinations.filter((_, i) => i !== index)
        .map(v => ({
          name: v.name,
          scheduledDate: v.scheduledDate ? new Date(v.scheduledDate).toISOString() : undefined
        }))
        .filter(v => v.name && v.scheduledDate);

      let completedDate;
      try {
        completedDate = vacToComplete.scheduledDate ? new Date(vacToComplete.scheduledDate) : (vacToComplete.date ? new Date(vacToComplete.date) : new Date());
        if (isNaN(completedDate.getTime())) completedDate = new Date();
      } catch (e) {
        completedDate = new Date();
      }

      const updatedCompleted = [
        ...completedVaccinations.map(v => ({
          name: v.name,
          date: v.date ? new Date(v.date).toISOString() : undefined
        })),
        {
          name: vacToComplete.name,
          date: completedDate.toISOString()
        }
      ].filter(v => v.name && v.date);

      const vaccinationData = {
        patientId,
        completedVaccinations: updatedCompleted,
        futureVaccinations: updatedScheduled
      };

      const endpoint = isPatient
        ? '/patients/vaccination-details'
        : '/doctors/vaccination-details';

      setLoading(true);
      const response = await apiClient.post(endpoint, vaccinationData);
      setLoading(false);

      if (response && response.data && response.data.success) {
        setSuccessMsg('✓ Vaccination marked as completed');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchVaccinations();
      } else {
        const errMsg = response?.data?.message || 'Error marking vaccination as completed';
        alert(errMsg);
        console.error('Mark as completed failed:', response?.data);
      }
    } catch (err) {
      setLoading(false);
      const message = err?.message || err?.originalError?.message || 'Error marking vaccination as completed';
      console.error('Error marking vaccination as completed:', err);
      alert(message);
    }
  };

  // Fetch vaccinations
  const fetchVaccinations = React.useCallback(async () => {
    try {
      setLoading(true);
      // Determine which endpoint to use based on user type
      const userType = localStorage.getItem('userType') || null;
      const isPatient = userType === 'patient';
      
      // Use health-records endpoint for patients (read-only or editable)
      // Use doctors endpoint for doctors
      const endpoint = isPatient
        ? `/health-records/vaccinations/${patientId}`
        : `/doctors/patient/${patientId}`;
      
      const response = await apiClient.get(endpoint);
      
      let completed = [];
      let scheduled = [];

      if (isPatient && Array.isArray(response.data)) {
        // Parse health-records format (array of vaccination documents)
        response.data.forEach(doc => {
          if (doc.completedVaccinations && Array.isArray(doc.completedVaccinations)) {
            completed.push(...doc.completedVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
          if (doc.futureVaccinations && Array.isArray(doc.futureVaccinations)) {
            scheduled.push(...doc.futureVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
        });
      } else if (response.data && response.data.vaccinations) {
        // Parse doctor endpoint format
        response.data.vaccinations.forEach(vac => {
          if (vac.completedVaccinations && Array.isArray(vac.completedVaccinations)) {
            completed.push(...vac.completedVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
          if (vac.futureVaccinations && Array.isArray(vac.futureVaccinations)) {
            scheduled.push(...vac.futureVaccinations.map(v => ({ ...v, _id: v._id || Math.random() })));
          }
        });
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
      setError('Error loading vaccinations');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchVaccinations();
  }, [fetchVaccinations]);

  // Handle adding new vaccination
  const handleAddVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const userType = localStorage.getItem('userType') || null;
      const isPatient = userType === 'patient';

      // Prepare completed and future vaccinations with correct structure and valid dates
      const completed = completedVaccinations.map(v => ({
        name: v.name,
        date: v.date ? new Date(v.date).toISOString() : undefined
      })).filter(v => v.name && v.date);
      const scheduled = scheduledVaccinations.map(v => ({
        name: v.name,
        scheduledDate: v.scheduledDate ? new Date(v.scheduledDate).toISOString() : undefined
      })).filter(v => v.name && v.scheduledDate);

      let completedVaccs = completed;
      let futureVaccs = scheduled;
      if (newVaccination.type === 'completed') {
        completedVaccs = [
          ...completed,
          { name: newVaccination.name, date: new Date(newVaccination.date).toISOString() }
        ];
      } else if (newVaccination.type === 'scheduled') {
        futureVaccs = [
          ...scheduled,
          { name: newVaccination.name, scheduledDate: new Date(newVaccination.date).toISOString() }
        ];
      }

      const vaccinationData = {
        patientId,
        completedVaccinations: completedVaccs,
        futureVaccinations: futureVaccs
      };

      // Use correct endpoint based on user type
      const endpoint = isPatient
        ? '/patients/vaccination-details'
        : '/doctors/vaccination-details';

      await apiClient.post(endpoint, vaccinationData);

      setSuccessMsg('✓ Vaccination added successfully');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Reset form
      setNewVaccination({ type: 'completed', name: '', date: '' });
      setShowAddForm(false);

      // Refresh data
      fetchVaccinations();
    } catch (err) {
      console.error('Error adding vaccination:', err);
      alert('Error adding vaccination');
    }
  };

  // Handle updating vaccination
  const handleUpdateVaccination = async (type, index) => {
    try {
      const userType = localStorage.getItem('userType') || null;
      const isPatient = userType === 'patient';
      
      const updatedCompleted = (type === 'completed' ?
        completedVaccinations.map((v, i) => i === index ? editData : v) :
        completedVaccinations
      ).map(v => ({
        name: v.name,
        date: v.date ? new Date(v.date).toISOString() : undefined
      })).filter(v => v.name && v.date);

      const updatedScheduled = (type === 'scheduled' ?
        scheduledVaccinations.map((v, i) => i === index ? editData : v) :
        scheduledVaccinations
      ).map(v => ({
        name: v.name,
        scheduledDate: v.scheduledDate ? new Date(v.scheduledDate).toISOString() : undefined
      })).filter(v => v.name && v.scheduledDate);

      const vaccinationData = {
        patientId,
        completedVaccinations: updatedCompleted,
        futureVaccinations: updatedScheduled
      };

      // Use correct endpoint based on user type
      const endpoint = isPatient
        ? '/patients/vaccination-details'
        : '/doctors/vaccination-details';
      
      await apiClient.post(endpoint, vaccinationData);
      
      setSuccessMsg('✓ Vaccination updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      setEditingId(null);
      setEditData({});
      fetchVaccinations();
    } catch (err) {
      console.error('Error updating vaccination:', err);
      alert('Error updating vaccination');
    }
  };

  // Handle deleting vaccination
  const handleDeleteVaccination = async (type, index) => {
    if (!window.confirm('Are you sure you want to delete this vaccination?')) {
      return;
    }

    try {
      const userType = localStorage.getItem('userType') || null;
      const isPatient = userType === 'patient';
      
      const updatedCompleted = (type === 'completed' ?
        completedVaccinations.filter((_, i) => i !== index) :
        completedVaccinations
      ).map(v => ({
        name: v.name,
        date: v.date ? new Date(v.date).toISOString() : undefined
      })).filter(v => v.name && v.date);

      const updatedScheduled = (type === 'scheduled' ?
        scheduledVaccinations.filter((_, i) => i !== index) :
        scheduledVaccinations
      ).map(v => ({
        name: v.name,
        scheduledDate: v.scheduledDate ? new Date(v.scheduledDate).toISOString() : undefined
      })).filter(v => v.name && v.scheduledDate);

      const vaccinationData = {
        patientId,
        completedVaccinations: updatedCompleted,
        futureVaccinations: updatedScheduled
      };

      // Use correct endpoint based on user type
      const endpoint = isPatient
        ? '/patients/vaccination-details'
        : '/doctors/vaccination-details';
      
      await apiClient.post(endpoint, vaccinationData);
      
      setSuccessMsg('✓ Vaccination deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      fetchVaccinations();
    } catch (err) {
      console.error('Error deleting vaccination:', err);
      alert('Error deleting vaccination');
    }
  };

  const startEdit = (type, index, item) => {
    setEditingId(`${type}-${index}`);
    setEditData({ ...item });
  };

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
        <h3><FaSyringe /> {readOnly ? 'Vaccination History' : 'Vaccination Management'}</h3>
        {!readOnly && (
          <button 
            className="btn-add-vac"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FaPlus /> Add Vaccination
          </button>
        )}
      </div>

      {successMsg && <div className="success-message">{successMsg}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Add New Vaccination Form - Hidden for readonly */}
      {!readOnly && showAddForm && (
        <div className="add-vac-form">
          <h4>Add New Vaccination</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select 
                value={newVaccination.type}
                onChange={(e) => setNewVaccination({...newVaccination, type: e.target.value})}
              >
                <option value="completed">Completed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vaccination Name</label>
              <input
                type="text"
                placeholder="e.g., COVID-19, Polio, Measles"
                value={newVaccination.name}
                onChange={(e) => setNewVaccination({...newVaccination, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newVaccination.date}
                onChange={(e) => setNewVaccination({...newVaccination, date: e.target.value})}
              />
            </div>
          </div>
          <div className="form-buttons">
            <button className="btn-save" onClick={handleAddVaccination}>
              <FaCheck /> Save
            </button>
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Completed Vaccinations Section */}
      <div className="vac-section">
        <h4 className="section-title">✅ Completed Vaccinations</h4>
        {completedVaccinations.length === 0 ? (
          <div className="empty-state">No completed vaccinations recorded</div>
        ) : (
          <div className="vac-table">
            <div className="table-header">
              <div className="col-name">Vaccination Name</div>
              <div className="col-date">Date</div>
              <div className="col-actions">Actions</div>
            </div>
            {completedVaccinations.map((vac, idx) => (
              <div key={idx} className="table-row">
                {editingId === `completed-${idx}` ? (
                  <>
                    <div className="col-name">
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-date">
                      <input
                        type="date"
                        value={editData.date ? editData.date.split('T')[0] : ''}
                        onChange={(e) => setEditData({...editData, date: e.target.value})}
                      />
                    </div>
                    <div className="col-actions">
                      {!readOnly && (
                        <>
                          <button 
                            className="btn-mini btn-save"
                            onClick={() => handleUpdateVaccination('completed', idx)}
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="btn-mini btn-cancel"
                            onClick={() => setEditingId(null)}
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-name">{vac.name}</div>
                    <div className="col-date">{formatDate(vac.date)}</div>
                    <div className="col-actions">
                      {!readOnly && (
                        <>
                          <button 
                            className="btn-mini btn-edit"
                            onClick={() => startEdit('completed', idx, vac)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-mini btn-delete"
                            onClick={() => handleDeleteVaccination('completed', idx)}
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Vaccinations Section */}
      <div className="vac-section">
        <h4 className="section-title">📅 Scheduled Vaccinations</h4>
        {scheduledVaccinations.length === 0 ? (
          <div className="empty-state">No scheduled vaccinations recorded</div>
        ) : (
          <div className="vac-table">
            <div className="table-header">
              <div className="col-name">Vaccination Name</div>
              <div className="col-date">Scheduled Date</div>
              <div className="col-actions">Actions</div>
            </div>
            {scheduledVaccinations.map((vac, idx) => (
              <div key={idx} className="table-row">
                {editingId === `scheduled-${idx}` ? (
                  <>
                    <div className="col-name">
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-date">
                      <input
                        type="date"
                        value={editData.scheduledDate ? editData.scheduledDate.split('T')[0] : ''}
                        onChange={(e) => setEditData({...editData, scheduledDate: e.target.value})}
                      />
                    </div>
                    <div className="col-actions">
                      {!readOnly && (
                        <>
                          <button 
                            className="btn-mini btn-save"
                            onClick={() => handleUpdateVaccination('scheduled', idx)}
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="btn-mini btn-cancel"
                            onClick={() => setEditingId(null)}
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-name">{vac.name}</div>
                    <div className="col-date">{formatDate(vac.scheduledDate || vac.date)}</div>
                    <div className="col-actions">
                      {!readOnly && (
                        <>
                          <button 
                            className="btn-mini btn-edit"
                            onClick={() => startEdit('scheduled', idx, vac)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-mini btn-delete"
                            onClick={() => handleDeleteVaccination('scheduled', idx)}
                          >
                            <FaTimes />
                          </button>
                          {/* Mark as Completed button */}
                          <button
                            className="btn-mini btn-complete"
                            title="Mark as Completed"
                            onClick={() => handleMarkAsCompleted(idx)}
                            disabled={loading}
                          >
                            {loading ? <FaSpinner className="spinner" /> : <FaCheck />}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}


          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorVaccinationView;
