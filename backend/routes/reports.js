const express = require('express');
const {
  createReport,
  getPatientReports,
  getDoctorReports
} = require('../controllers/reportController');
const router = express.Router();

router.post('/', createReport);
router.get('/patient/:patientId', getPatientReports);
router.get('/doctor/:doctorId', getDoctorReports);

module.exports = router;
