const express = require('express');
const {
  createAlert,
  getPatientAlerts,
  markAlertAsRead,
  getUnreadAlertCount
} = require('../controllers/alertController');
const router = express.Router();

router.post('/', createAlert);
router.get('/patient/:patientId', getPatientAlerts);
router.get('/patient/:patientId/unread-count', getUnreadAlertCount);
router.put('/:alertId/read', markAlertAsRead);

module.exports = router;
