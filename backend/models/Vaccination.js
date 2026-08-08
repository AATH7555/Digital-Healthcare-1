const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vaccinationName: String,
  status: {
    type: String,
    enum: ['completed', 'pending', 'scheduled'],
    default: 'pending'
  },
  vaccinationDetails: [{
    date: Date,
    time: String,
    location: String
  }],
  // Completed vaccinations array
  completedVaccinations: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: String,
    location: String,
    _id: mongoose.Schema.Types.ObjectId
  }],
  // Scheduled/Future vaccinations array
  futureVaccinations: [{
    name: {
      type: String,
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    daysUntil: Number,
    _id: mongoose.Schema.Types.ObjectId
  }],
  weeklyReport: [{
    week: Number,
    details: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);
