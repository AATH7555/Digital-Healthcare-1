const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  healthId: String,
  patientName: String,
  email: String,
  tablets: [mongoose.Schema.Types.Mixed],
  vaccinations: [mongoose.Schema.Types.Mixed],
  qrCode: String, // Base64 encoded QR code
  createdAt: {
    type: Date,
    default: Date.now
  },
  scannedBy: [String],
  lastScanned: Date
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
