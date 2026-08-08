const express = require('express');
const { 
  getAllDoctors,
  getAllPatients,
  addTablet, 
  updateTablet, 
  addVaccination, 
  updateVaccination, 
  generateQRCode, 
  scanQRCode,
  updatePatientDetails,
  getPatientDetails,
  addMedication,
  addVaccinationDetails,
  getBookedAppointments
} = require('../controllers/doctorController');
const { authMiddleware, requireDoctor } = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllDoctors);
router.get('/all-patients', authMiddleware, requireDoctor, getAllPatients);
router.get('/patient/:patientId', authMiddleware, requireDoctor, getPatientDetails);
router.put('/patient/:patientId', authMiddleware, requireDoctor, updatePatientDetails);
router.post('/tablet', authMiddleware, requireDoctor, addTablet);
router.put('/tablet/:tabletId', authMiddleware, requireDoctor, updateTablet);
router.post('/vaccination', authMiddleware, requireDoctor, addVaccination);
router.put('/vaccination/:vaccinationId', authMiddleware, requireDoctor, updateVaccination);
router.post('/qr-generate/:patientId', authMiddleware, requireDoctor, generateQRCode);
router.post('/qr-scan', authMiddleware, requireDoctor, scanQRCode);
router.post('/medication', authMiddleware, requireDoctor, addMedication);
router.post('/vaccination-details', authMiddleware, requireDoctor, addVaccinationDetails);
router.get('/appointments/booked', authMiddleware, requireDoctor, getBookedAppointments);

module.exports = router;
