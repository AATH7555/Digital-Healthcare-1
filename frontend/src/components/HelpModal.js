import React from 'react';
import { FaTimes, FaQuestionCircle, FaShieldAlt, FaBook } from 'react-icons/fa';
import './HelpModal.css';

function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Help & Information</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="help-section">
            <div className="section-icon"><FaQuestionCircle /></div>
            <h4>What is Digital Healthcare System?</h4>
            <p>
              Digital Healthcare System is a comprehensive health management platform that helps patients 
              track their medications, vaccinations, and health records. It also enables doctors to manage 
              patient information securely and efficiently.
            </p>
          </div>

          <div className="help-section">
            <div className="section-icon"><FaShieldAlt /></div>
            <h4>Your Health ID</h4>
            <p>
              Each patient receives a unique Health ID (e.g., health0001) upon account creation. This ID is used 
              to identify you in the system and is included in your QR code for easy health information sharing 
              with healthcare providers.
            </p>
          </div>

          <div className="help-section">
            <div className="section-icon"><FaBook /></div>
            <h4>How to Use Each Feature</h4>
            <div className="features-list">
              <div className="feature">
                <strong>Medications:</strong> View, track, and manage all your prescribed medications with dosage 
                and schedule information.
              </div>
              <div className="feature">
                <strong>Vaccinations:</strong> Keep track of completed vaccinations and upcoming vaccination 
                appointments.
              </div>
              <div className="feature">
                <strong>QR Code:</strong> Generate and share your health QR code with healthcare providers for 
                quick access to your health information.
              </div>
              <div className="feature">
                <strong>Health AI:</strong> Ask health-related questions and get instant responses from our 
                AI-powered health assistant.
              </div>
            </div>
          </div>

          <div className="help-section">
            <h4>Data Privacy & Security</h4>
            <p>
              Your health information is encrypted and securely stored. Only authorized healthcare providers can 
              access your data. All QR code scans are logged for your security.
            </p>
          </div>

          <div className="help-section">
            <h4>Tips for Best Experience</h4>
            <ul className="tips-list">
              <li>Keep your Health ID safe and confidential</li>
              <li>Update your medication information regularly</li>
              <li>Review your health records periodically</li>
              <li>Contact your doctor for any medical advice</li>
              <li>Enable notifications for upcoming appointments</li>
            </ul>
          </div>

          <div className="help-section">
            <h4>Need More Help?</h4>
            <p>
              For technical support or any questions, please contact our support team at 
              <strong>support@digitalhealthcare.com</strong><br />
              <span style={{ display: 'block', marginTop: '10px', fontWeight: 'bold', fontSize: '18px', color: '#2d7a2d' }}>
                📞 Contact Number: 9344641738
              </span>
              <br />Or call <strong>1-800-HEALTH-1</strong>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Got It</button>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;
