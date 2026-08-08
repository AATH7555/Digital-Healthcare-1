const express = require('express');
const {
  getPatientByHealthId,
  getAllPatients,
  getDashboard,
  updatePatientProfile,
  addVaccinationDetails,
  updateVaccinationDetails
} = require('../controllers/patientController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Patient routes
router.get('/', getAllPatients);
router.get('/dashboard/info', authMiddleware, getDashboard);
router.get('/:healthId', getPatientByHealthId);
router.put('/:id', authMiddleware, updatePatientProfile);
router.post('/vaccination-details', authMiddleware, addVaccinationDetails);
router.put('/vaccination-details', authMiddleware, updateVaccinationDetails);

module.exports = router;
