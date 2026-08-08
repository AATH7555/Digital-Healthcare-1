import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginPage from './pages/LoginPage';
import FrontPage from './pages/FrontPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AppointmentsSystemPage from './pages/AppointmentsSystemPage';
import AppointmentsShowcase from './pages/AppointmentsShowcase';
import AppointmentsManagementSystem from './pages/AppointmentsManagementSystem';
import DoctorAppointmentsPage from './pages/DoctorAppointmentsPage';
import DoctorMedicationsPage from './pages/DoctorMedicationsPage';
import DoctorManagedMedicationsPage from './pages/DoctorManagedMedicationsPage';
import DoctorVaccinationsPage from './pages/DoctorVaccinationsPage';
import DoctorManagedVaccinationsPage from './pages/DoctorManagedVaccinationsPage';
import DoctorVaccinationViewPage from './pages/DoctorVaccinationViewPage';
import DoctorPatientProfilePage from './pages/DoctorPatientProfilePage';
import DoctorScannerPage from './pages/DoctorScannerPage';
import DoctorQRCodeScanPage from './pages/DoctorQRCodeScanPage';
import PatientMedicationsPage from './pages/PatientMedicationsPage';
import PatientVaccinationsPage from './pages/PatientVaccinationsPage';
import PatientVaccinationViewPage from './pages/PatientVaccinationViewPage';
import PatientVaccinationDoctorViewPage from './pages/PatientVaccinationDoctorViewPage';
import PatientHealthAIPage from './pages/PatientHealthAIPage';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import PatientHealthAlertsPage from './pages/PatientHealthAlertsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import PatientHealthRecordsPage from './pages/PatientHealthRecordsPage';
import PatientQRCodePage from './pages/PatientQRCodePage';
import DoctorMeetingsPage from './pages/DoctorMeetingsPage';
import PatientMeetingsPage from './pages/PatientMeetingsPage';
import './App.css';

function App() {
  const [userType, setUserType] = React.useState(localStorage.getItem('userType') || null);
  const [token, setToken] = React.useState(localStorage.getItem('token') || null);

  const handleLogin = (type, authToken) => {
    setUserType(type);
    setToken(authToken);
    localStorage.setItem('userType', type);
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setUserType(null);
    setToken(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <LanguageProvider>
        <Routes>
        <Route path="/front" element={<FrontPage />} />
        <Route path="/appointments-showcase" element={<AppointmentsShowcase />} />
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route 
          path="/patient-dashboard" 
          element={token && userType === 'patient' ? <PatientDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor-dashboard" 
          element={token && userType === 'doctor' ? <DoctorDashboard onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/appointments" 
          element={token ? <AppointmentsManagementSystem /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/appointments/:patientId" 
          element={token && userType === 'doctor' ? <DoctorAppointmentsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/medications/:patientId" 
          element={token && userType === 'doctor' ? <DoctorMedicationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/manage-medications/:patientId" 
          element={token && userType === 'doctor' ? <DoctorManagedMedicationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/vaccinations/:patientId" 
          element={token && userType === 'doctor' ? <DoctorVaccinationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/manage-vaccinations/:patientId" 
          element={token && userType === 'doctor' ? <DoctorManagedVaccinationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/vaccination-view/:patientId" 
          element={token && userType === 'doctor' ? <DoctorVaccinationViewPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/profile/:patientId" 
          element={token && userType === 'doctor' ? <DoctorPatientProfilePage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/scanner/:patientId" 
          element={token && userType === 'doctor' ? <DoctorScannerPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/qr-scan" 
          element={token && userType === 'doctor' ? <DoctorQRCodeScanPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/doctor/meetings" 
          element={token && userType === 'doctor' ? <DoctorMeetingsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/medications" 
          element={token && userType === 'patient' ? <PatientMedicationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/vaccinations" 
          element={token && userType === 'patient' ? <PatientVaccinationsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/vaccination-view" 
          element={token && userType === 'patient' ? <PatientVaccinationViewPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/vaccination-doctor-view" 
          element={token && userType === 'patient' ? <PatientVaccinationDoctorViewPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/health-ai" 
          element={token && userType === 'patient' ? <PatientHealthAIPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/appointments" 
          element={token && userType === 'patient' ? <PatientAppointmentsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/health-alerts" 
          element={token && userType === 'patient' ? <PatientHealthAlertsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/profile" 
          element={token && userType === 'patient' ? <PatientProfilePage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/health-records" 
          element={token && userType === 'patient' ? <PatientHealthRecordsPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/qr-code" 
          element={token && userType === 'patient' ? <PatientQRCodePage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/patient/meetings" 
          element={token && userType === 'patient' ? <PatientMeetingsPage /> : <Navigate to="/" />} 
        />
        </Routes>
      </LanguageProvider>
    </Router>
  );
}

export default App;
