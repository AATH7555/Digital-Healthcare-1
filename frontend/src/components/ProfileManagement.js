import React, { useState } from 'react';
import { FaUser, FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './ProfileManagement.css';

function ProfileManagement({ user, userType }) {
  const [profile, setProfile] = useState({
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    allergies: [],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    specialization: '',
    medicalLicense: '',
    hospitalAffiliation: '',
    yearsOfExperience: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      emergencyContact: { ...profile.emergencyContact, [name]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/profiles', {
        userId: user._id,
        userType,
        ...profile
      });

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-management">
      <h3><FaUser /> Update Profile</h3>
      
      {submitted && <div className="success-message">✓ Profile saved successfully!</div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h4>Personal Information</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={profile.gender} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <select name="bloodType" value={profile.bloodType} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Address</h4>
          
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={profile.address}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={profile.state}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={profile.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {userType === 'doctor' && (
          <div className="form-section">
            <h4>Professional Information</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Cardiology"
                />
              </div>
              <div className="form-group">
                <label>Medical License</label>
                <input
                  type="text"
                  name="medicalLicense"
                  value={profile.medicalLicense}
                  onChange={handleChange}
                  placeholder="License number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hospital Affiliation</label>
                <input
                  type="text"
                  name="hospitalAffiliation"
                  value={profile.hospitalAffiliation}
                  onChange={handleChange}
                  placeholder="Hospital name"
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={profile.yearsOfExperience}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h4>Emergency Contact</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={profile.emergencyContact.name}
                onChange={handleEmergencyChange}
                placeholder="Emergency contact name"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={profile.emergencyContact.phone}
                onChange={handleEmergencyChange}
                placeholder="Emergency contact phone"
              />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input
                type="text"
                name="relation"
                value={profile.emergencyContact.relation}
                onChange={handleEmergencyChange}
                placeholder="e.g., Family member"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-submit">
          <FaCheck /> {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

export default ProfileManagement;
