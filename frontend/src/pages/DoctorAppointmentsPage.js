import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
// import BookedAppointments from '../components/BookedAppointments';
import './DoctorDetailPage.css';

import { useParams } from 'react-router-dom';
import PatientAppointments from '../components/PatientAppointments';

function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const selectedPatient = JSON.parse(localStorage.getItem('selectedPatient') || 'null');

  const handleBack = () => {
    if (selectedPatient) {
      navigate('/doctor-dashboard', { state: { selectedPatient } });
    } else {
      navigate('/doctor-dashboard');
    }
  };

  return (
    <div className="doctor-detail-page">
      <button className="top-back-button" onClick={handleBack}>
        <FaArrowLeft /> Back
      </button>
      <div className="detail-container">
        <h1>📅 Appointments</h1>
        {selectedPatient && (
          <div className="selected-patient-banner" style={{margin: '8px 0', padding: '8px', background: '#f5f7fb', borderRadius: 4}}>
            Viewing appointments for: <strong>{selectedPatient.name}</strong>
            {selectedPatient.healthId ? ` (Health ID: ${selectedPatient.healthId})` : null}
          </div>
        )}
        <div className="appointments-page-layout full-width">
          <div className="left-section">
            <h2>Patient Info</h2>
            {selectedPatient ? (
              <>
                <p><strong>Name:</strong> {selectedPatient.name}</p>
                <p><strong>Health ID:</strong> {selectedPatient.healthId || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedPatient.email || 'N/A'}</p>
              </>
            ) : (
              <p>Select an appointment to view patient details</p>
            )}
          </div>
          <div className="right-section">
            {patientId && (
              <PatientAppointments patientId={patientId} refreshKey={patientId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorAppointmentsPage;
