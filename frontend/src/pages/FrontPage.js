import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaClock, FaUser, FaCheckCircle, FaArrowRight, FaStethoscope, FaHospitalUser } from 'react-icons/fa';
import './FrontPage.css';
import SlidesModal from '../components/SlidesModal';

function FrontPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const [slidesOpen, setSlidesOpen] = useState(false);

  return (
    <div className="front-page">
      {/* Header/Navigation */}
      <header className="fp-header">
        <div className="fp-header-content">
          <div className="fp-logo">
            <FaCalendar className="logo-icon" />
            <h1>HealthHub</h1>
          </div>
          <nav className="fp-nav">
            {token && userType === 'doctor' && (
              <>
                <button onClick={() => navigate('/doctor-dashboard')} className="fp-nav-btn">
                  Doctor Portal
                </button>
                <button onClick={() => navigate('/appointments')} className="fp-nav-btn active">
                  Appointments
                </button>
              </>
            )}
            {token && userType === 'patient' && (
              <>
                <button onClick={() => navigate('/patient-dashboard')} className="fp-nav-btn">
                  Patient Portal
                </button>
                <button onClick={() => navigate('/appointments')} className="fp-nav-btn active">
                  My Appointments
                </button>
              </>
            )}
            {!token && (
              <button onClick={() => navigate('/')} className="fp-nav-btn">
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="fp-hero">
        <div className="fp-hero-content">
          <h1 className="fp-hero-title">
            📅 Appointment Management System
          </h1>
          <p className="fp-hero-subtitle">
            Manage your healthcare appointments efficiently and securely
          </p>
          
          <div className="fp-hero-buttons">
            {token ? (
              <button 
                onClick={() => navigate('/appointments')} 
                className="fp-btn fp-btn-primary"
              >
                Go to Appointments <FaArrowRight />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/')} 
                  className="fp-btn fp-btn-primary"
                >
                  Login Now <FaArrowRight />
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  className="fp-btn fp-btn-secondary"
                >
                  Create Account
                </button>
                  <button
                    onClick={() => setSlidesOpen(true)}
                    className="fp-btn fp-btn-secondary"
                    style={{minWidth:120}}
                  >
                    Slides
                  </button>
              </>
            )}
          </div>
        </div>

        <div className="fp-hero-image">
          <div className="hero-graphic">
            <FaCalendar className="hero-icon" />
          </div>
        </div>
      </section>

      {/* Appointments Preview Section */}
      <section className="fp-appointments-preview">
        <h2>📅 Live Appointment Examples</h2>
        <p className="preview-subtitle">See how appointments are displayed individually in the system</p>
        
        <div className="appointments-examples">
          {/* Example 1 */}
          <div className="appointment-example">
            <div className="example-header">
              <span className="doctor-badge">Doctor View</span>
              <span className="status-badge active">Scheduled</span>
            </div>
            <div className="example-content">
              <h4>👨‍⚕️ Patient Name</h4>
              <div className="example-detail">
                <span>📅 Date:</span>
                <strong>Monday, February 10, 2026</strong>
              </div>
              <div className="example-detail">
                <span>🕐 Time:</span>
                <strong>2:30 PM</strong>
              </div>
              <div className="example-detail">
                <span>🔍 Reason:</span>
                <strong>General Checkup</strong>
              </div>
              <div className="example-actions">
                <button className="action-complete">✓ Complete</button>
                <button className="action-cancel">✗ Cancel</button>
              </div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="appointment-example">
            <div className="example-header">
              <span className="patient-badge">Patient View</span>
              <span className="status-badge completed">Completed</span>
            </div>
            <div className="example-content">
              <h4>👨‍⚕️ Dr. Johnson Smith</h4>
              <div className="example-detail">
                <span>📅 Date:</span>
                <strong>Saturday, February 8, 2026</strong>
              </div>
              <div className="example-detail">
                <span>🕐 Time:</span>
                <strong>10:00 AM</strong>
              </div>
              <div className="example-detail">
                <span>🔍 Reason:</span>
                <strong>Annual Physical</strong>
              </div>
              <div className="example-actions">
                <span className="completed-badge">✓ Completed</span>
              </div>
            </div>
          </div>

          {/* Example 3 */}
          <div className="appointment-example">
            <div className="example-header">
              <span className="doctor-badge">Doctor View</span>
              <span className="status-badge cancelled">Cancelled</span>
            </div>
            <div className="example-content">
              <h4>👨‍⚕️ Patient Name</h4>
              <div className="example-detail">
                <span>📅 Date:</span>
                <strong>Wednesday, February 12, 2026</strong>
              </div>
              <div className="example-detail">
                <span>🕐 Time:</span>
                <strong>3:15 PM</strong>
              </div>
              <div className="example-detail">
                <span>🔍 Reason:</span>
                <strong>Follow-up Consultation</strong>
              </div>
              <div className="example-actions">
                <span className="cancelled-badge">✗ Cancelled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-cta">
          <p>Start managing appointments now</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/appointments-showcase')} 
              className="preview-btn"
            >
              View All Examples <FaArrowRight />
            </button>
              <button
                onClick={() => setSlidesOpen(true)}
                className="preview-btn"
              >
                Open Slides
              </button>
            {!token ? (
              <button 
                onClick={() => navigate('/')} 
                className="preview-btn"
              >
                Login to Access <FaArrowRight />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/appointments')} 
                className="preview-btn"
              >
                Full System <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="fp-features">
        <h2>✨ Key Features</h2>
        <div className="fp-features-grid">
          {/* Feature 1 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaClock />
            </div>
            <h3>Schedule Appointments</h3>
            <p>Easily book and schedule your healthcare appointments with doctors</p>
            <ul className="feature-list">
              <li>Real-time availability</li>
              <li>Quick booking</li>
              <li>Automatic reminders</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaCheckCircle />
            </div>
            <h3>Track Status</h3>
            <p>Monitor your appointment status from scheduled to completed</p>
            <ul className="feature-list">
              <li>Active appointments</li>
              <li>Completed history</li>
              <li>Cancellation tracking</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaUser />
            </div>
            <h3>Patient Management</h3>
            <p>Doctors can efficiently manage their patient appointments</p>
            <ul className="feature-list">
              <li>Patient details view</li>
              <li>Appointment history</li>
              <li>Status updates</li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaStethoscope />
            </div>
            <h3>Doctor Dashboard</h3>
            <p>Comprehensive dashboard for healthcare professionals</p>
            <ul className="feature-list">
              <li>My appointments</li>
              <li>Patient scheduling</li>
              <li>Quick actions</li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaHospitalUser />
            </div>
            <h3>Patient Portal</h3>
            <p>Complete patient appointment management interface</p>
            <ul className="feature-list">
              <li>View appointments</li>
              <li>Cancel if needed</li>
              <li>Appointment history</li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="fp-feature-card">
            <div className="feature-icon">
              <FaCalendar />
            </div>
            <h3>Unified System</h3>
            <p>Access appointments from any view - portal or standalone</p>
            <ul className="feature-list">
              <li>Standalone page</li>
              <li>Portal integration</li>
              <li>Consistent access</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="fp-how-it-works">
        <h2>🚀 How It Works</h2>
        <div className="fp-steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Login/Register</h3>
            <p>Create your account as a doctor or patient</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Navigate</h3>
            <p>Go to Appointments or use your portal</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Manage</h3>
            <p>View, create, or modify appointments</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Monitor status and receive notifications</p>
          </div>
        </div>
      </section>

      {/* Access Points Section */}
      <section className="fp-access-points">
        <h2>📍 Multiple Access Points</h2>
        <div className="fp-access-grid">
          <div className="access-card">
            <h3>🏥 Doctor Portal</h3>
            <p>Access appointments within your main doctor dashboard</p>
            <code>/doctor-dashboard</code>
            <p className="access-desc">View scheduled appointments automatically when you login</p>
          </div>
          
          <div className="access-card">
            <h3>👤 Patient Portal</h3>
            <p>Manage your appointments in the patient dashboard</p>
            <code>/patient-dashboard</code>
            <p className="access-desc">Check your appointments and health records in one place</p>
          </div>

          <div className="access-card">
            <h3>📅 Standalone System</h3>
            <p>Dedicated appointments management page</p>
            <code>/appointments</code>
            <p className="access-desc">Full-featured appointments system accessible anytime</p>
          </div>

          <div className="access-card">
            <h3>🔍 QR Scanner</h3>
            <p>View patient appointments via QR code scan</p>
            <code>/doctor/qr-scan</code>
            <p className="access-desc">Scan patient QR to view their appointments instantly</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="fp-stats">
        <div className="stat-item">
          <div className="stat-number">3</div>
          <p>Access Points</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">4</div>
          <p>Status Types</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">∞</div>
          <p>Appointments</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <p>Available</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="fp-cta">
        <h2>Ready to Get Started?</h2>
        <p>Join HealthHub and manage your appointments efficiently</p>
        {!token ? (
          <button 
            onClick={() => navigate('/')} 
            className="fp-btn fp-btn-large"
          >
            Login or Register <FaArrowRight />
          </button>
        ) : (
          <button 
            onClick={() => navigate('/appointments')} 
            className="fp-btn fp-btn-large"
          >
            View Your Appointments <FaArrowRight />
          </button>
        )}
      </section>

      <SlidesModal open={slidesOpen} onClose={() => setSlidesOpen(false)} />

      {/* Footer */}
      <footer className="fp-footer">
        <p>&copy; 2026 HealthHub. Appointment Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default FrontPage;
