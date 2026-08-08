const mongoose = require('mongoose');

// Patient model with health ID generator and authentication fields
const generateHealthId = () => {
  const prefix = 'HEALTH';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  // concatenate parts into a single string
  return `${prefix}${timestamp}${random}`;
};

const patientSchema = new mongoose.Schema({
  healthId: {
    type: String,
    unique: true,
    default: generateHealthId
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodType: String,
  allergies: [String],
  medicalHistory: [String],
  // OTP and password reset fields
  resetOTP: {
    type: String,
    default: null
  },
  resetOTPExpiry: {
    type: Date,
    default: null
  },
  isOTPVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);
