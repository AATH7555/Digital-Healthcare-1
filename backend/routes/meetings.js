const express = require('express');
const {
  createMeeting,
  getPatientMeetings,
  getDoctorMeetings,
  deleteMeeting
} = require('../controllers/meetingController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createMeeting);
router.get('/patient/:patientId', authMiddleware, getPatientMeetings);
router.get('/doctor/:doctorId', authMiddleware, getDoctorMeetings);
router.delete('/:meetingId', authMiddleware, deleteMeeting);

module.exports = router;
