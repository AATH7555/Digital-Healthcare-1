const mongoose = require('mongoose');

const tabletSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  // Old format fields (for backward compatibility)
  tabletName: String,
  dosage: String,
  schedule: [{
    day: String,
    time: String
  }],
  startDate: Date,
  endDate: Date,
  weeklyReport: [{
    week: Number,
    details: String
  }],
  
  // New format fields (for daily/weekly medication management)
  medicationType: {
    type: String,
    enum: ['daily', 'weekly', null],
    default: null
  },
  tablets: [{
    name: String,
    time: {
      type: String,
      enum: ['morning', 'afternoon', 'night']
    },
    date: Date
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

module.exports = mongoose.model('Tablet', tabletSchema);
