const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  reportType: {
    type: String,
    enum: ['general-health', 'lab-report', 'prescription', 'discharge-summary'],
    required: true
  },
  title: String,
  description: String,
  findings: String,
  recommendations: String,
  attachmentUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
