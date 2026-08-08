import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PatientProfileView from '../components/PatientProfileView';
import apiClient from '../utils/api';
import './DoctorDetailPage.css';

function DoctorPatientProfilePage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(() => JSON.parse(localStorage.getItem('selectedPatient') || 'null'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPatient = async () => {
      // If localStorage already has the selected patient and ids match, use it
      const cached = JSON.parse(localStorage.getItem('selectedPatient') || 'null');
      if (cached && String(cached._id) === String(patientId)) {
        setPatientData(cached);
        return;
      }

      // otherwise fetch from API
      setLoading(true);
      try {
        const res = await apiClient.get(`/patients/${patientId}`);
        if (res && res.data) {
          setPatientData(res.data);
          localStorage.setItem('selectedPatient', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error('Unable to fetch patient details:', err);
        // fallback: keep whatever is in localStorage (may be null)
      } finally {
        setLoading(false);
      }
    };
    if (patientId) loadPatient();
  }, [patientId]);

  const handleBack = () => {
    const selectedPatient = JSON.parse(localStorage.getItem('selectedPatient') || 'null');
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
        <h1>👤 Patient Profile</h1>
        <div className="detail-content full-width">
          {loading ? (
            <div>Loading patient...</div>
          ) : patientData ? (
            <PatientProfileView patient={patientData} />
          ) : (
            <div>No patient data available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatientProfilePage;
