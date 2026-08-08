import React, { useRef, useState } from 'react';
import { FaCamera, FaCheck, FaSpinner } from 'react-icons/fa';
import apiClient from '../utils/api';
import './QRScanner.css';

function QRScanner({ patientData }) {
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const fileInputRef = useRef(null);

  const fetchPatientDetails = async (patient) => {
    setLoading(true);
    try {
      // Fetch medications
      const medsResponse = await apiClient.get(`/health-records/tablets/${patient._id}`);
      if (medsResponse.data) {
        const raw = medsResponse.data;
        const meds = [];
        if (Array.isArray(raw)) {
          raw.forEach(doc => {
            if (doc.tablets && Array.isArray(doc.tablets)) {
              doc.tablets.forEach(t => meds.push({
                name: t.name || doc.tabletName,
                dosage: doc.dosage || t.dosage,
                frequency: doc.medicationType === 'daily' ? 'Daily' : (doc.medicationType === 'weekly' ? 'Weekly' : ''),
                startDate: t.date || doc.startDate,
                endDate: doc.endDate,
                status: doc.status || 'Active'
              }));
            } else if (doc.tabletName) {
              meds.push({ name: doc.tabletName, dosage: doc.dosage, startDate: doc.startDate, endDate: doc.endDate, status: doc.status || 'Active' });
            }
          });
        }
        setMedications(meds);
      }

      // Fetch vaccinations
      const vacResponse = await apiClient.get(`/health-records/vaccinations/${patient._id}`);
      if (vacResponse.data) {
        const raw = vacResponse.data;
        const list = [];
        if (Array.isArray(raw)) {
          raw.forEach(doc => {
            if (doc.completedVaccinations && Array.isArray(doc.completedVaccinations)) {
              doc.completedVaccinations.forEach(v => list.push({ name: v.name, date: v.date, dose: v.dose, batchNumber: v.batchNumber, status: 'Completed' }));
            }
            if (doc.futureVaccinations && Array.isArray(doc.futureVaccinations)) {
              doc.futureVaccinations.forEach(v => list.push({ name: v.name, nextDue: v.scheduledDate || v.nextDue, status: 'Scheduled' }));
            }
            if (doc.vaccinationName) {
              list.push({ name: doc.vaccinationName, date: doc.vaccinationDetails?.[0]?.date || doc.date, status: doc.status || 'Pending' });
            }
          });
        }
        setVaccinations(list);
      }

      setScanResult(patient);
      setScanned(true);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      // Even if API fails, show basic patient info
      setScanResult(patient);
      setScanned(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate QR code scanning
        fetchPatientDetails(patientData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setScanResult(null);
    setMedications([]);
    setVaccinations([]);
    fileInputRef.current.value = '';
  };

  return (
    <div className="qr-scanner">
      {!scanned ? (
        <div className="scanner-container">
          <div className="camera-placeholder">
            <FaCamera />
          </div>
          <h4>Scan Patient QR Code</h4>
          <p>Upload or scan the patient's QR code to view their complete health information</p>
          
          <button 
            type="button" 
            className="btn-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaCamera /> Choose QR Code File
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : loading ? (
        <div className="scanner-loading">
          <FaSpinner className="spinner-icon" />
          <h4>Loading Patient Data...</h4>
          <p>Fetching medications, vaccinations and profile details...</p>
        </div>
      ) : (
        <div className="scanner-result">
          <div className="result-header">
            <FaCheck className="success-icon" />
            <h4>QR Code Scanned Successfully</h4>
          </div>

          <div className="result-data">
            {/* Patient Profile Section */}
            <div className="data-group profile-section">
              <h5>👤 Patient Profile</h5>
              <div className="patient-card-info">
                <div className="data-item full-width">
                  <span className="label">Full Name:</span>
                  <span className="value">{scanResult?.name}</span>
                </div>
                <div className="data-item">
                  <span className="label">Health ID:</span>
                  <span className="value badge-id">{scanResult?.healthId}</span>
                </div>
                <div className="data-item">
                  <span className="label">Email:</span>
                  <span className="value">{scanResult?.email}</span>
                </div>
                {scanResult?.age && (
                  <div className="data-item">
                    <span className="label">Age:</span>
                    <span className="value">{scanResult.age}</span>
                  </div>
                )}
                {scanResult?.bloodType && (
                  <div className="data-item">
                    <span className="label">Blood Type:</span>
                    <span className="value badge-blood">{scanResult.bloodType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Medications Section */}
            <div className="data-group medications-section">
              <h5>💊 Current Medications & Tablets</h5>
              {medications && medications.length > 0 ? (
                <div className="items-list">
                  {medications.map((medication, index) => (
                    <div key={index} className="item-card">
                      <div className="item-header">
                        <span className="item-name">{medication.name}</span>
                        {medication.status && (
                          <span className="item-badge">{medication.status}</span>
                        )}
                      </div>
                      <div className="item-details">
                        {medication.dosage && (
                          <div className="detail-row">
                            <span>Dosage:</span> <strong>{medication.dosage}</strong>
                          </div>
                        )}
                        {medication.frequency && (
                          <div className="detail-row">
                            <span>Frequency:</span> <strong>{medication.frequency}</strong>
                          </div>
                        )}
                        {medication.reason && (
                          <div className="detail-row">
                            <span>Reason:</span> <strong>{medication.reason}</strong>
                          </div>
                        )}
                        {medication.startDate && (
                          <div className="detail-row">
                            <span>Started:</span> <strong>{new Date(medication.startDate).toLocaleDateString()}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No medications recorded</p>
              )}
            </div>

            {/* Vaccinations Section */}
            <div className="data-group vaccinations-section">
              <h5>💉 Vaccinations</h5>
              {vaccinations && vaccinations.length > 0 ? (
                <div className="items-list">
                  {vaccinations.map((vaccine, index) => (
                    <div key={index} className="item-card vaccination-card">
                      <div className="item-header">
                        <span className="item-name">{vaccine.name}</span>
                        <span className={`status-badge ${vaccine.status?.toLowerCase()}`}>
                          {vaccine.status}
                        </span>
                      </div>
                      <div className="item-details">
                        {vaccine.date && (
                          <div className="detail-row">
                            <span>Date:</span> <strong>{new Date(vaccine.date).toLocaleDateString()}</strong>
                          </div>
                        )}
                        {vaccine.dose && (
                          <div className="detail-row">
                            <span>Dose:</span> <strong>{vaccine.dose}</strong>
                          </div>
                        )}
                        {vaccine.batchNumber && (
                          <div className="detail-row">
                            <span>Batch Number:</span> <strong>{vaccine.batchNumber}</strong>
                          </div>
                        )}
                        {vaccine.nextDue && (
                          <div className="detail-row">
                            <span>Next Due:</span> <strong>{new Date(vaccine.nextDue).toLocaleDateString()}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No vaccinations recorded</p>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button type="button" className="btn-scan-again" onClick={handleReset}>
              <FaCamera /> Scan Another Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
