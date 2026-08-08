const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('email-validator');
const nodemailer = require('nodemailer');

// Generate unique Health ID
function generateHealthId() {
  const randomNum = Math.floor(Math.random() * 10000);
  return `health${String(randomNum).padStart(4, '0')}`;
}

// Patient Registration
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // prior we enforced format with email-validator; we now allow any string
    // as the system does not require a real address.  Keeping normalization
    // but skipping strict format check.
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    let patient = await Patient.findOne({ email: normalizedEmail });
    if (patient) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let healthId;
    let exists = true;
    while (exists) {
      healthId = generateHealthId();
      exists = await Patient.findOne({ healthId });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    patient = new Patient({
      healthId,
      name,
      email: normalizedEmail,
      password: hashedPassword
    });

    await patient.save();

    const token = jwt.sign(
      { id: patient._id, email: patient.email, type: 'patient' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      patient: {
        id: patient._id,
        healthId: patient.healthId,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Check if it's a database connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection error. Please try again in a few seconds.',
        error: 'Database unavailable' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error registering patient', 
      error: error.message 
    });
  }
};

// Patient Login
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    const patient = await Patient.findOne({ email: normalizedEmail });
    if (!patient) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: patient._id, email: patient.email, type: 'patient' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Patient logged in successfully',
      token,
      patient: {
        id: patient._id,
        healthId: patient.healthId,
        name: patient.name,
        email: patient.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    // Check if it's a database connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection error. Please try again in a few seconds.',
        error: 'Database unavailable' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

// Doctor Login (Fixed Credentials)
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Fixed doctor credentials
    if (email !== 'doctor@gmail.com' || password !== 'health123') {
      return res.status(401).json({ success: false, message: 'Invalid doctor credentials' });
    }

    const token = jwt.sign(
      { email: 'doctor@gmail.com', type: 'doctor', id: 'doctor-1' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Doctor logged in successfully',
      token,
      doctor: {
        _id: 'doctor-1',
        id: 'doctor-1',
        email: 'doctor@gmail.com',
        name: 'Dr. Healthcare Administrator',
        type: 'doctor'
      }
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

// Setup Email Transporter
const setupEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('setupEmailTransporter: missing EMAIL_USER or EMAIL_PASSWORD env vars');
  }
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


