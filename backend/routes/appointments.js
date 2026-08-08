const express = require('express');
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getBookedAppointments
} = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Appointment routes
router.post('/', createAppointment);
router.get('/patient/:patientId', getPatientAppointments);
router.get('/doctor/:doctorId', getDoctorAppointments);
router.get('/booked/list', authMiddleware, getBookedAppointments);
router.put('/:appointmentId/status', updateAppointmentStatus);
router.delete('/:appointmentId', cancelAppointment);

module.exports = router;
