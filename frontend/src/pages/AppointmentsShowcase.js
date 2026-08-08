import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCalendar, FaClock, FaStethoscope, FaUser } from 'react-icons/fa';
import './AppointmentsShowcase.css';

function AppointmentsShowcase() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const appointmentExamples = [
    {
      id: 1,
      type: 'Doctor View',
      status: 'active',
      patientName: 'John Anderson',
      date: 'Monday, February 10, 2026',
      time: '2:30 PM',
      reason: 'General Checkup',
      doctorName: 'Dr. Sarah Smith'
    },
    {
      id: 2,
      type: 'Patient View',
      status: 'completed',
      patientName: 'You',
      date: 'Saturday, February 8, 2026',
      time: '10:00 AM',
      reason: 'Annual Physical',
      doctorName: 'Dr. Johnson Smith'
    },
    {
      id: 3,
      type: 'Doctor View',
      status: 'cancelled',
      patientName: 'Emma Wilson',
      date: 'Wednesday, February 12, 2026',
      time: '3:15 PM',
      reason: 'Follow-up Consultation',
      doctorName: 'Dr. Michael Brown'
    },
    {
      id: 4,
      type: 'Patient View',
      status: 'active',
      patientName: 'You',
      date: 'Tuesday, February 11, 2026',
      time: '1:00 PM',
      reason: 'Blood Test Results Review',
      doctorName: 'Dr. Sarah Smith'
    }
  ];

  const filteredAppointments = selectedStatus === 'all' 
    ? appointmentExamples 
    : appointmentExamples.filter(apt => apt.status === selectedStatus);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="appointments-showcase">
      {/* Header */}
      <header className="showcase-header">
        <div className="showcase-header-content">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <div className="header-title">
            <FaCalendar className="header-icon" />
            <h1>📅 Appointment Examples</h1>
          </div>
          {token && (
            <button 
              className="portal-button"
              onClick={() => navigate(userType === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard')}
            >
              {userType === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="showcase-container">
        {/* Info Section */}
        <section className="showcase-info">
          <h2>How Appointments Work</h2>
          <p>Below are examples of how appointments are displayed and managed in the HealthHub system. Each appointment shows different views and statuses.</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <FaCalendar className="feature-icon" />
              <h3>Schedule</h3>
              <p>Book and manage appointments with doctors</p>
            </div>
            <div className="feature-card">
              <FaClock className="feature-icon" />
              <h3>Time Management</h3>
              <p>Track appointment dates and times easily</p>
            </div>
            <div className="feature-card">
              <FaStethoscope className="feature-icon" />
              <h3>Doctor Review</h3>
              <p>Doctors can view patient appointment history</p>
            </div>
            <div className="feature-card">
              <FaUser className="feature-icon" />
              <h3>Patient Access</h3>
              <p>Patients can track their medical visits</p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section">
          <h3>Filter by Status</h3>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              All Appointments
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'active' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('active')}
            >
              Scheduled
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${selectedStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </section>

        {/* Appointments Grid */}
        <section className="appointments-grid-section">
          <div className="appointments-grid">
            {filteredAppointments.map((apt) => (
              <div 
                key={apt.id} 
                className={`appointment-showcase-card ${getStatusBadgeClass(apt.status)}`}
              >
                <div className="card-header">
                  <div className="type-badge">{apt.type}</div>
                  <div className={`status-badge ${apt.status}`}>
                    {getStatusLabel(apt.status)}
                  </div>
                </div>

                <div className="card-content">
                  <div className="appointment-detail">
                    <span className="label">👨‍⚕️ Doctor:</span>
                    <span className="value">{apt.doctorName}</span>
                  </div>

                  <div className="appointment-detail">
                    <span className="label">👤 Patient:</span>
                    <span className="value">{apt.patientName}</span>
                  </div>

                  <div className="appointment-detail">
                    <span className="label">📅 Date:</span>
                    <span className="value">{apt.date}</span>
                  </div>

                  <div className="appointment-detail">
                    <span className="label">🕐 Time:</span>
                    <span className="value">{apt.time}</span>
                  </div>

                  <div className="appointment-detail">
                    <span className="label">📋 Reason:</span>
                    <span className="value">{apt.reason}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {apt.status === 'active' && (
                    <>
                      <button className="action-btn complete">✓ Complete</button>
                      <button className="action-btn cancel">✗ Cancel</button>
                    </>
                  )}
                  {apt.status === 'completed' && (
                    <span className="action-status completed">✓ Completed</span>
                  )}
                  {apt.status === 'cancelled' && (
                    <span className="action-status cancelled">✗ Cancelled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!token && (
          <section className="cta-section">
            <div className="cta-content">
              <h2>Ready to Manage Your Appointments?</h2>
              <p>Login to access the full appointment management system</p>
              <button 
                className="cta-button"
                onClick={() => navigate('/')}
              >
                Login Now <FaArrowRight />
              </button>
            </div>
          </section>
        )}

        {token && (
          <section className="cta-section">
            <div className="cta-content">
              <h2>View Your Appointments</h2>
              <p>Access the full appointment system from your portal</p>
              <button 
                className="cta-button"
                onClick={() => navigate('/appointments')}
              >
                Go to Full System <FaArrowRight />
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="showcase-footer">
        <p>&copy; 2026 HealthHub - Appointment Management System</p>
      </footer>
    </div>
  );
}

export default AppointmentsShowcase;
