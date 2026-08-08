const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  phone: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  bloodType: String,
  allergies: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  profilePicture: String,
  medicalLicense: String,
  specialization: String,
  hospitalAffiliation: String,
  yearsOfExperience: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
