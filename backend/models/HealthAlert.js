const mongoose = require('mongoose');

const healthAlertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  alertType: {
    type: String,
    enum: ['medication-reminder', 'vaccination-due', 'appointment-reminder', 'health-warning'],
    required: true
  },
  title: String,
  message: String,
  dueDate: Date,
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HealthAlert', healthAlertSchema);
