const express = require('express');
const Tablet = require('../models/Tablet');
const Vaccination = require('../models/Vaccination');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/tablets/:patientId', authMiddleware, async (req, res) => {
  try {
    const tablets = await Tablet.find({ patientId: req.params.patientId })
      .sort({ startDate: -1 })
      .lean();
    res.json(tablets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tablets', error: error.message });
  }
});

router.get('/vaccinations/:patientId', authMiddleware, async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(vaccinations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vaccinations', error: error.message });
  }
});

module.exports = router;
