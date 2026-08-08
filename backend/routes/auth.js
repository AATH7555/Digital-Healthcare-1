const express = require('express');
const { registerPatient, loginPatient, loginDoctor } = require('../controllers/authController');
const router = express.Router();

// Patient routes
router.post('/register-patient', registerPatient);
router.post('/login-patient', loginPatient);


// Doctor routes
router.post('/login-doctor', loginDoctor);

module.exports = router;
