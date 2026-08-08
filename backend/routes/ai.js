const express = require('express');
const { 
  processHealthQuestion,
  getHealthTips,
  getEmergencyGuidance
} = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// AI Health Chat endpoints
router.post('/ask', authMiddleware, processHealthQuestion);
router.get('/tips', getHealthTips);
router.get('/emergency', getEmergencyGuidance);

module.exports = router;
