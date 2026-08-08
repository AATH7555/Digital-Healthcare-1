import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import io from 'socket.io-client';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './BookedAppointments.css';

function BookedAppointments({ patientId = null, readOnly = false, refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientsMap, setPatientsMap] = useState({});
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(() => JSON.parse(localStorage.getItem('selectedPatient') || 'null'));
  const navigate = useNavigate();
  const [doctorsMap, setDoctorsMap] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, [patientId, refreshKey]);

  // fetch patients once so we can resolve patient names if appointments are not populated
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await apiClient.get('/patients');
        if (Array.isArray(res.data)) {
          const map = {};
          res.data.forEach(p => { map[String(p._id)] = p.name; });
          setPatientsMap(map);
          setPatientsList(res.data);
        }
      } catch (err) {
        // non-fatal
        console.warn('Unable to fetch patients list to resolve names', err.message || err);
      }
    };
    fetchPatients();
  }, []);

  // also fetch doctors so we can detect if patientId is mistakenly a doctor id
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiClient.get('/doctors');
        if (Array.isArray(res.data)) {
          const map = {};
          res.data.forEach(d => { map[String(d._id)] = d.name; });
          setDoctorsMap(map);
        }
      } catch (err) {
        console.warn('Unable to fetch doctors list', err.message || err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('appointments-updated', () => fetchAppointments());
    return () => socket.close();
  }, []);

  const fetchAppointments = async () => {
    try {
      const endpoint = patientId ? `/appointments/patient/${patientId}` : '/appointments/booked/list';
      const response = await apiClient.get(endpoint);
      console.debug('booked appointments response:', response.data);
      const dataAppointments = response.data && (response.data.appointments || response.data);
      if (dataAppointments) {
        // Sort by appointment date - earliest first
        const sorted = dataAppointments.sort((a, b) => 
          new Date(a.appointmentDate) - new Date(b.appointmentDate)
        );
        setAppointments(sorted);

        // ensure top always shows a selected patient — default to first appointment's patient
        if (!selectedPatient && sorted.length > 0) {
          const apt = sorted[0];
          let pid = '';
          try {
            if (apt.patientId && typeof apt.patientId === 'object') pid = String(apt.patientId._id || apt.patientId);
            else pid = String(apt.patientId || '');
          } catch (e) { pid = String(apt.patientId || ''); }

          const patient = patientsList.find(p => String(p._id) === pid);
          if (patient) {
            setSelectedPatient(patient);
            localStorage.setItem('selectedPatient', JSON.stringify(patient));
          } else if (apt.patientId && typeof apt.patientId === 'object' && apt.patientId.name) {
            const pObj = { name: apt.patientId.name, healthId: apt.patientId.healthId };
            setSelectedPatient(pObj);
            localStorage.setItem('selectedPatient', JSON.stringify(pObj));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      fetchAppointments();
    } catch (err) {
      console.error('Error marking finished:', err);
      alert('Unable to mark appointment as finished');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This will also remove it from the patient\'s view.')) {
      return;
    }
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Unable to delete appointment');
    }
  };

  const handleSelectPatient = (apt) => {
    if (patientId) return; // patient view should not switch selected patient
    // derive id string for patient
    let pid = '';
    try {
      if (apt.patientId && typeof apt.patientId === 'object') pid = String(apt.patientId._id || apt.patientId);
      else pid = String(apt.patientId || '');
    } catch (e) { pid = String(apt.patientId || ''); }

    const patient = patientsList.find(p => String(p._id) === pid) || null;
    if (patient) {
      setSelectedPatient(patient);
      localStorage.setItem('selectedPatient', JSON.stringify(patient));
      // On small screens, navigate to the patient profile page
      try {
        // Navigate when the patient-left panel is hidden (mobile layout).
        const leftPanel = document.querySelector('.appointments-page-layout .left-section');
        const leftHidden = leftPanel && window.getComputedStyle(leftPanel).display === 'none';
        if (leftHidden || (typeof window !== 'undefined' && window.innerWidth <= 768)) {
          navigate(`/doctor/profile/${pid}`);
        }
      } catch (e) { /* ignore navigation errors */ }
    } else {
      setSelectedPatient(null);
      localStorage.removeItem('selectedPatient');
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

    return (
    <div className="booked-appointments">
      <h3>📅 Booked Appointments</h3>
      {selectedPatient && (
        <div className="selected-patient-banner">
          Viewing appointments for: <strong>{selectedPatient.name}</strong> (Health ID: {selectedPatient.healthId})
        </div>
      )}
      
      {appointments.length === 0 ? (
        <p className="no-data">No booked appointments</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt, idx) => (
            <div key={apt._id} className="appointment-card" onClick={() => handleSelectPatient(apt)} style={{cursor: 'pointer'}}>
              <div className="apt-number">{idx + 1}</div>
              <div className="apt-details">
                <h4>{
                  // prefer populated name
                  (apt.patientId && typeof apt.patientId === 'object' && apt.patientId.name) ||
                  (() => {
                    // derive stable id string whether apt.patientId is an ObjectId, populated object, or string
                    let pid = '';
                    try {
                      if (apt.patientId && typeof apt.patientId === 'object') {
                        pid = String(apt.patientId._id || apt.patientId);
                      } else {
                        pid = String(apt.patientId || '');
                      }
                    } catch (e) { pid = String(apt.patientId || ''); }

                    if (patientsMap && patientsMap[pid]) return patientsMap[pid];
                    if (doctorsMap && doctorsMap[pid]) {
                      console.warn(`Appointment ${apt._id} patientId resolves to a doctor id (${doctorsMap[pid]}). Possible data issue.`);
                      return 'Unknown Patient';
                    }
                    return 'Patient';
                  })()
                }</h4>
                <p><strong>Health ID:</strong> {(apt.patientId && apt.patientId.healthId) || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {apt.appointmentTime}</p>
                <p><strong>Reason:</strong> {apt.reason}</p>
              </div>
              {!patientId && !readOnly && (
                <div className="apt-actions">
                  <button className="apt-action finish" title="Mark finished" onClick={(e) => { e.stopPropagation(); handleFinish(apt._id); }}>
                    <FaCheck />
                  </button>
                  <button className="apt-action delete" title="Delete appointment" onClick={(e) => { e.stopPropagation(); handleDelete(apt._id); }}>
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookedAppointments;
