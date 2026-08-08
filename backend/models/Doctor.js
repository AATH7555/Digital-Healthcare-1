const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Doctor'
  },
  email: {
    type: String,
    default: 'doctor@gmail.com',
    unique: true
  },
  password: {
    type: String,
    default: 'health123'
  },
  specialization: {
    type: String,
    default: 'General Practice'
  },
  phone: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'General Medicine'
  },
  location: {
    type: String,
    default: 'Main Clinic'
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

module.exports = mongoose.model('Doctor', doctorSchema);
