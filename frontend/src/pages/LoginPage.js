import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { validatePatientEmail } from '../utils/helpers';

import './LoginPage.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isPatientLogin, setIsPatientLogin] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const [patientLoginData, setPatientLoginData] = useState({ email: '', password: '' });
  const [patientRegisterData, setPatientRegisterData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [doctorLoginData, setDoctorLoginData] = useState({
    email: 'doctor@gmail.com',
    password: 'health123'
  });

  // Clear sensitive data on page unload
  React.useEffect(() => {
    return () => {
      // Clear login data from memory
      setPatientLoginData({ email: '', password: '' });
      setPatientRegisterData({ name: '', email: '', password: '' });
    };
  }, []);

  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!patientLoginData.email || !patientLoginData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      const response = await authAPI.loginPatient(patientLoginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'patient');
      localStorage.setItem('patientInfo', JSON.stringify(response.data.patient));
      onLogin('patient', response.data.token);
      // Clear sensitive data
      setPatientLoginData({ email: '', password: '' });
      navigate('/patient-dashboard');
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      // Don't log full error as it may contain sensitive info
      console.error('Login error - check browser security logs');
    }
    setLoading(false);
  };

  const handlePatientRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!patientRegisterData.name || !patientRegisterData.email || !patientRegisterData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      const response = await authAPI.registerPatient(patientRegisterData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'patient');
      localStorage.setItem('patientInfo', JSON.stringify(response.data.patient));
      onLogin('patient', response.data.token);
      // show confirmation message before redirecting
      alert('Welcome to digital health system!\nYour account has been successfully created.');
      // Clear sensitive data
      setPatientRegisterData({ name: '', email: '', password: '' });
      navigate('/patient-dashboard');
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      // Don't log full error as it may contain sensitive info
      console.error('Registration error - check browser security logs');
    }
    setLoading(false);
  };

  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.loginDoctor(doctorLoginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'doctor');
      localStorage.setItem('doctorInfo', JSON.stringify(response.data.doctor));
      onLogin('doctor', response.data.token);
      navigate('/doctor-dashboard');
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Doctor login failed';
      setError(errorMsg);
      console.error('Doctor login error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="tabs">
          <button 
            className={`tab ${isPatientLogin ? 'active' : ''}`}
            onClick={() => {
              setIsPatientLogin(true);
              setIsRegistering(false);
              setError('');
            }}
          >
            Patient
          </button>
          <button 
            className={`tab ${!isPatientLogin ? 'active' : ''}`}
            onClick={() => {
              setIsPatientLogin(false);
              setError('');
            }}
          >
            Doctor
          </button>
        </div>

        <div className="form-container">
          {isPatientLogin ? (
            <>
              {!isRegistering ? (
                <form onSubmit={handlePatientLogin}>
                  <h2>Patient Login</h2>
                  {error && <div className="error-message">{error}</div>}
                  
                  <div className="form-group">
                    <label>Email</label>
                    {/* use text to allow non-standard addresses if needed */}
                    <input
                      type="text"
                      required
                      value={patientLoginData.email}
                      onChange={(e) => setPatientLoginData({ ...patientLoginData, email: e.target.value })}
                      placeholder="Enter your email"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      value={patientLoginData.password}
                      onChange={(e) => setPatientLoginData({ ...patientLoginData, password: e.target.value })}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      spellCheck="false"
                    />
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>



                  <p className="toggle-link" onClick={() => setIsRegistering(true)}>
                    Don't have an account? <span>Create Account</span>
                  </p>
                </form>
              ) : (
                <form onSubmit={handlePatientRegister}>
                  <h2>Create Account</h2>
                  {error && <div className="error-message">{error}</div>}
                  
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      required
                      value={patientRegisterData.name}
                      onChange={(e) => setPatientRegisterData({ ...patientRegisterData, name: e.target.value })}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    {/* changed to text so even malformed addresses are accepted */}
                    <input
                      type="text"
                      required
                      value={patientRegisterData.email}
                      onChange={(e) => setPatientRegisterData({ ...patientRegisterData, email: e.target.value })}
                      placeholder="Enter your email"
                      autoComplete="email"
                      spellCheck="false"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      value={patientRegisterData.password}
                      onChange={(e) => setPatientRegisterData({ ...patientRegisterData, password: e.target.value })}
                      placeholder="Create a password (min 6 characters)"
                      autoComplete="new-password"
                      spellCheck="false"
                    />
                  </div>

                  <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <p className="toggle-link" onClick={() => setIsRegistering(false)}>
                    Already have an account? <span>Login</span>
                  </p>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handleDoctorLogin}>
              <h2>Doctor Login</h2>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={doctorLoginData.email}
                  readOnly
                  placeholder="doctor@gmail.com"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={doctorLoginData.password}
                  readOnly
                  placeholder="health123"
                  autoComplete="off"
                />
              </div>

              <p className="info-text">Use the provided credentials to login as a doctor.</p>

              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Doctor Login'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="info-banner">
        <h3>Welcome to Digital Healthcare System</h3>
        <p>Secure health records management with QR code integration and AI-powered health assistance</p>
      </div>


    </div>
  );
}

export default LoginPage;
