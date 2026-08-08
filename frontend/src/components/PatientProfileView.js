import React, { useState } from 'react';
import { FaUser, FaEdit, FaCheck } from 'react-icons/fa';
import apiClient from '../utils/api';
import './PatientProfileView.css';

function PatientProfileView({ patient }) {
  const [profileData, setProfileData] = useState({
    name: patient?.name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dateOfBirth: patient?.dateOfBirth || '',
    bloodType: patient?.bloodType || '',
    gender: patient?.gender || '',
    allergies: patient?.allergies || '',
    address: patient?.address || '',
    city: patient?.city || '',
    medicalHistory: patient?.medicalHistory || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put(`/patients/${patient._id}`, profileData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile-view">
      <div className="profile-header">
        <h3><FaUser /> Patient Profile</h3>
        <button
          className="btn-edit"
          onClick={() => setIsEditing(!isEditing)}
        >
          <FaEdit /> {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {saved && <div className="success-msg">✓ Profile updated successfully</div>}

      <div className="profile-grid">
        <div className="profile-field">
          <label>Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.name}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Email</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.email}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Phone</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.phone || 'N/A'}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Date of Birth</label>
          {isEditing ? (
            <input
              type="date"
              name="dateOfBirth"
              value={profileData.dateOfBirth?.split('T')[0] || ''}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Blood Type</label>
          {isEditing ? (
            <select name="bloodType" value={profileData.bloodType} onChange={handleChange}>
              <option value="">Select</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          ) : (
            <p>{profileData.bloodType || 'N/A'}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Gender</label>
          {isEditing ? (
            <select name="gender" value={profileData.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p>{profileData.gender || 'N/A'}</p>
          )}
        </div>

        <div className="profile-field full-width">
          <label>Allergies</label>
          {isEditing ? (
            <textarea
              name="allergies"
              value={profileData.allergies}
              onChange={handleChange}
              placeholder="List any allergies"
            />
          ) : (
            <p>{profileData.allergies || 'None listed'}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Address</label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.address || 'N/A'}</p>
          )}
        </div>

        <div className="profile-field">
          <label>City</label>
          {isEditing ? (
            <input
              type="text"
              name="city"
              value={profileData.city}
              onChange={handleChange}
            />
          ) : (
            <p>{profileData.city || 'N/A'}</p>
          )}
        </div>

        <div className="profile-field full-width">
          <label>Medical History</label>
          {isEditing ? (
            <textarea
              name="medicalHistory"
              value={profileData.medicalHistory}
              onChange={handleChange}
              placeholder="Medical history"
            />
          ) : (
            <p>{profileData.medicalHistory || 'None listed'}</p>
          )}
        </div>
      </div>

      {isEditing && (
        <button className="btn-save" onClick={handleSave} disabled={loading}>
          <FaCheck /> Save Profile
        </button>
      )}
    </div>
  );
}

export default PatientProfileView;
