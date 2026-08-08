import React, { useRef, useState, useEffect } from 'react';
import { FaCamera, FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiClient from '../utils/api';
import './QRScanner.css';
import './BookedAppointments.css';

function DoctorPatientQRScanner() {
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [manualHealthId, setManualHealthId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop scanner if active
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.warn('Error destroying scanner:', err);
        }
      }
    };
  }, []);

  const fetchPatientByHealthId = async (healthId) => {
    setLoading(true);
    try {
      const patientResponse = await apiClient.get(`/patients/${healthId}`);
      const { patient, tablets = [], vaccinations: vacs = [] } = patientResponse.data;

      const meds = [];
      if (Array.isArray(tablets)) {
        tablets.forEach(doc => {
          if (doc.tablets && Array.isArray(doc.tablets)) {
            doc.tablets.forEach(t => meds.push({
              name: t.name || doc.tabletName,
              dosage: doc.dosage || t.dosage,
              frequency: doc.medicationType === 'daily' ? 'Daily' : (doc.medicationType === 'weekly' ? 'Weekly' : ''),
              startDate: t.date || doc.startDate,
              endDate: doc.endDate,
              status: 'Active'
            }));
          } else if (doc.tabletName) {
            meds.push({
              name: doc.tabletName,
              dosage: doc.dosage,
              startDate: doc.startDate,
              endDate: doc.endDate,
              status: 'Active'
            });
          }
        });
      }

      const list = [];
      if (Array.isArray(vacs)) {
        vacs.forEach(doc => {
          if (doc.completedVaccinations && Array.isArray(doc.completedVaccinations)) {
            doc.completedVaccinations.forEach(v => list.push({
              name: v.name,
              date: v.date,
              dose: v.dose,
              batchNumber: v.batchNumber,
              status: 'Completed'
            }));
          }
          if (doc.futureVaccinations && Array.isArray(doc.futureVaccinations)) {
            doc.futureVaccinations.forEach(v => list.push({
              name: v.name,
              nextDue: v.scheduledDate || v.nextDue,
              status: 'Scheduled'
            }));
          }
        });
      }

      setScanResult(patient);
      setMedications(meds);
      setVaccinations(list);
      
      // Fetch appointments for the patient
      try {
        const appointmentsResponse = await apiClient.get(`/appointments/patient/${patient._id}`);
        const aptsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse.data.appointments || [];
        const sortedApts = aptsData.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        setAppointments(sortedApts);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      }
      
      setScanned(true);
      setCameraActive(false);
    } catch (err) {
      console.error('Error fetching patient:', err);
      alert('Patient not found. Please check the Health ID.');
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setLoadingCamera(true);

      // Check if reader div exists
      const readerElement = document.getElementById('reader');
      if (!readerElement) {
        alert('Scanner container not found');
        setLoadingCamera(false);
        return;
      }

      // Create scanner instance if not already created
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0
          },
          false
        );
      }

      const onScanSuccess = (decodedText, decodedResult) => {
        console.log('QR code decoded:', decodedText);
        let healthId = decodedText;
        try {
          const url = new URL(decodedText);
          const segments = url.pathname.split('/').filter(Boolean);
          healthId = segments[segments.length - 1] || decodedText;
        } catch (e) {
          // Not a URL, use raw text
        }

        // Stop scanner and fetch patient
        scannerRef.current.clear();
        scannerRef.current = null;
        setCameraActive(false);
        setLoadingCamera(false);
        fetchPatientByHealthId(healthId);
      };

      const onScanFailure = (error) => {
        // Ignore scan errors - they happen naturally while scanning
        console.debug('Scan error (normal):', error);
      };

      // Start the scanner
      scannerRef.current.render(onScanSuccess, onScanFailure);
      setCameraActive(true);
      setLoadingCamera(false);
    } catch (err) {
      console.error('Camera error:', err);
      alert(`Could not start camera: ${err.message}`);
      setCameraActive(false);
      setLoadingCamera(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    }
    setCameraActive(false);
    setLoadingCamera(false);
  };

  const handleManualSearch = () => {
    if (manualHealthId.trim()) {
      const id = manualHealthId.trim();
      setManualHealthId('');
      fetchPatientByHealthId(id);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setScanResult(null);
    setMedications([]);
    setVaccinations([]);
    setAppointments([]);
    setManualHealthId('');
    setCompletionSuccess(null);
    stopCamera();
  };

  const handleFinishAppointment = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      setCompletionSuccess('✓ Appointment marked as completed!');
      setTimeout(() => setCompletionSuccess(null), 4000);
      
      // Refresh appointments list
      if (scanResult) {
        try {
          const appointmentsResponse = await apiClient.get(`/appointments/patient/${scanResult._id}`);
          const aptsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse.data.appointments || [];
          const sortedApts = aptsData.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
          setAppointments(sortedApts);
        } catch (err) {
          console.error('Error refreshing appointments:', err);
        }
      }
    } catch (err) {
      console.error('Error completing appointment:', err);
      alert('Unable to update appointment');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await apiClient.delete(`/appointments/${appointmentId}`);
      
      // Refresh appointments list
      if (scanResult) {
        try {
          const appointmentsResponse = await apiClient.get(`/appointments/patient/${scanResult._id}`);
          const aptsData = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : appointmentsResponse.data.appointments || [];
          const sortedApts = aptsData.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
          setAppointments(sortedApts);
        } catch (err) {
          console.error('Error refreshing appointments:', err);
        }
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Unable to cancel appointment');
    }
  };

  return (
    <div className="qr-scanner w-full max-w-4xl mx-auto">
      {!scanned ? (
        <div className="scanner-container bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div 
            id="reader" 
            className="mb-6 rounded-lg overflow-hidden bg-gray-100"
            style={{ 
              display: cameraActive ? 'flex' : 'none', 
              width: '100%', 
              height: '300px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          ></div>

          {!cameraActive && (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4 text-blue-600">
                  <FaCamera />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Scan Patient QR Code</h4>
                <p className="text-gray-600 text-lg">Scan a patient's QR code to view their complete health information</p>
              </div>

              <div className="flex flex-col gap-4 mb-6">
                <button 
                  type="button" 
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  onClick={startCamera} 
                  disabled={loadingCamera}
                  style={{
                    opacity: loadingCamera ? 0.6 : 1,
                    cursor: loadingCamera ? 'wait' : 'pointer'
                  }}
                >
                  {loadingCamera ? (
                    <>⏳ Initializing Camera...</>
                  ) : (
                    <>
                      <FaCamera /> Start Camera
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 text-center">Or Enter Health ID Manually</h5>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="e.g., HEALTH123456"
                    value={manualHealthId}
                    onChange={(e) => setManualHealthId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="button" 
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
                    onClick={handleManualSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            </>
          )}

          {cameraActive && (
            <div className="flex justify-center">
              <button 
                type="button" 
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
                onClick={stopCamera}
              >
                <FaTimes /> Stop Camera
              </button>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="scanner-loading bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4 text-blue-600 animate-spin">
            <FaSpinner />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-2">Loading Patient Data...</h4>
          <p className="text-gray-600 text-lg">Fetching medications, vaccinations and profile details...</p>
        </div>
      ) : (
        <div className="scanner-result space-y-6">
          {completionSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-md">
              {completionSuccess}
            </div>
          )}

          <div className="result-header bg-white rounded-lg shadow-lg p-6 flex items-center gap-4">
            <div className="text-3xl text-green-600">
              <FaCheck />
            </div>
            <h4 className="text-2xl font-bold text-gray-800">Patient Found</h4>
          </div>

          <div className="result-data space-y-6">
            {/* Patient Profile Section */}
            <div className="data-group profile-section bg-white rounded-lg shadow-lg p-6">
              <h5 className="text-xl font-bold text-gray-800 mb-4">👤 Patient Profile</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-600">Full Name</label>
                  <p className="text-lg text-gray-800 font-medium">{scanResult?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Health ID</label>
                  <p className="text-lg text-gray-800 bg-blue-100 px-3 py-2 rounded inline-block font-mono">{scanResult?.healthId}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Phone</label>
                  <p className="text-lg text-gray-800">{scanResult?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                  <p className="text-lg text-gray-800">{scanResult?.dateOfBirth ? new Date(scanResult.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Gender</label>
                  <p className="text-lg text-gray-800">{scanResult?.gender || 'N/A'}</p>
                </div>
                {scanResult?.bloodType && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Blood Type</label>
                    <p className="text-lg text-gray-800 bg-red-100 px-3 py-2 rounded inline-block font-bold">{scanResult.bloodType}</p>
                  </div>
                )}
                {scanResult?.medicalHistory && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Medical History</label>
                    <p className="text-lg text-gray-700">{scanResult.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medications Section */}
            <div className="data-group medications-section bg-white rounded-lg shadow-lg p-6">
              <h5 className="text-xl font-bold text-gray-800 mb-4">💊 Current Medications &amp; Tablets</h5>
              {medications && medications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications.map((medication, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-bold text-gray-800 text-lg">{medication.name}</span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">{medication.status}</span>
                      </div>
                      {medication.dosage && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Dosage:</span> {medication.dosage}
                        </div>
                      )}
                      {medication.frequency && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Frequency:</span> {medication.frequency}
                        </div>
                      )}
                      {medication.startDate && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Started:</span> {new Date(medication.startDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No medications recorded</p>
              )}
            </div>

            {/* Vaccinations Section */}
            <div className="data-group vaccinations-section bg-white rounded-lg shadow-lg p-6">
              <h5 className="text-xl font-bold text-gray-800 mb-4">💉 Vaccinations</h5>
              {vaccinations && vaccinations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vaccinations.map((vaccine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-bold text-gray-800 text-lg">{vaccine.name}</span>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${
                          vaccine.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vaccine.status}
                        </span>
                      </div>
                      {vaccine.date && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Date:</span> {new Date(vaccine.date).toLocaleDateString()}
                        </div>
                      )}
                      {vaccine.dose && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">Dose:</span> {vaccine.dose}
                        </div>
                      )}
                      {vaccine.nextDue && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Next Due:</span> {new Date(vaccine.nextDue).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No vaccinations recorded</p>
              )}
            </div>

            {/* Appointments Section */}
            <div className="booked-appointments two-column">
              <h5 className="text-xl font-bold text-white mb-4">📅 Patient Appointments</h5>
              
              {appointments && appointments.length > 0 ? (
                <div className="appointments-split">
                  <div className="left-column">
                    <h4>New / Active</h4>
                    {appointments.filter(a => (a.status || 'scheduled') === 'scheduled').length === 0 ? (
                      <p className="no-data">No active appointments</p>
                    ) : (
                      <div className="appointments-list">
                        {appointments.filter(a => (a.status || 'scheduled') === 'scheduled').map((apt, idx) => (
                          <div key={apt._id} className="appointment-card">
                            <div className="apt-number">{idx + 1}</div>
                            <div className="apt-details">
                              <h4>{
                                (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) ||
                                'Doctor'
                              }</h4>
                              <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {apt.appointmentTime}</p>
                              <p><strong>Reason:</strong> {apt.reason}</p>
                              <p><strong>Status:</strong> {apt.status || 'Scheduled'}</p>
                            </div>
                            <div className="apt-actions">
                              <button
                                className="apt-action finish"
                                title="Mark finished"
                                onClick={() => handleFinishAppointment(apt._id)}
                              >
                                <FaCheck />
                              </button>
                              <button
                                className="apt-action cancel"
                                title="Cancel appointment"
                                onClick={() => handleCancelAppointment(apt._id)}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="right-column">
                    <h4>Cancelled</h4>
                    {appointments.filter(a => a.status === 'cancelled').length === 0 ? (
                      <p className="no-data">No cancelled appointments</p>
                    ) : (
                      <div className="appointments-list">
                        {appointments.filter(a => a.status === 'cancelled').map((apt, idx) => (
                          <div key={apt._id} className="appointment-card">
                            <div className="apt-number">{idx + 1}</div>
                            <div className="apt-details">
                              <h4>{
                                (apt.doctorId && typeof apt.doctorId === 'object' && apt.doctorId.name) ||
                                'Doctor'
                              }</h4>
                              <p><strong>Date:</strong> {new Date(apt.appointmentDate).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {apt.appointmentTime}</p>
                              <p><strong>Reason:</strong> {apt.reason}</p>
                              <p><strong>Status:</strong> {apt.status || 'cancelled'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="no-data">No appointments recorded</p>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              type="button" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
              onClick={handleReset}
            >
              <FaCamera /> Scan Another Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatientQRScanner;
