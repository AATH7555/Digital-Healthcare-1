import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = 'Network error - please check your connection';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
      
      // Handle specific server errors
      if (error.response.status === 503) {
        errorMessage = 'Server temporarily unavailable. Retrying connection...';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server - connection failed';
    } else {
      // Error in request setup
      errorMessage = error.message || errorMessage;
    }
    
    console.error('API Error:', errorMessage, error.response?.data);
    
    return Promise.reject({
      message: errorMessage,
      originalError: error
    });
  }
);

export const authAPI = {
  registerPatient: (data) => apiClient.post('/auth/register-patient', data),
  loginPatient: (data) => apiClient.post('/auth/login-patient', data),
  loginDoctor: (data) => apiClient.post('/auth/login-doctor', data)
};

export const patientAPI = {
  getAllPatients: () => apiClient.get('/patients'),
  getDashboard: () => apiClient.get('/patients/dashboard/info'),
  getPatientByHealthId: (healthId) => apiClient.get(`/patients/${healthId}`),
  refreshPatientData: () => apiClient.get('/patients/dashboard/info')
};

export const doctorAPI = {
  addTablet: (data) => apiClient.post('/doctors/tablet', data),
  updateTablet: (id, data) => apiClient.put(`/doctors/tablet/${id}`, data),
  addVaccination: (data) => apiClient.post('/doctors/vaccination', data),
  updateVaccination: (id, data) => apiClient.put(`/doctors/vaccination/${id}`, data),
  generateQRCode: (patientId) => apiClient.post(`/doctors/qr-generate/${patientId}`),
  scanQRCode: (data) => apiClient.post('/doctors/qr-scan', data),
  getPatientDetails: (patientId) => apiClient.get(`/doctors/patient/${patientId}`),
  updatePatientDetails: (patientId, data) => apiClient.put(`/doctors/patient/${patientId}`, data)
};

export const aiAPI = {
  askQuestion: (question, patientId, patientContext) => apiClient.post('/ai/ask', {
    question,
    patientId,
    patientContext
  }),
  getHealthTips: () => apiClient.get('/ai/tips'),
  getEmergencyGuidance: () => apiClient.get('/ai/emergency')
};

export default apiClient;
