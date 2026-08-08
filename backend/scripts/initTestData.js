const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
require('dotenv').config();

async function initTestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if test patient exists
    const testPatientEmail = 'patient@gmail.com';
    let patient = await Patient.findOne({ email: testPatientEmail });

    if (!patient) {
      console.log('Creating test patient...');
      const hashedPassword = await bcrypt.hash('patient123', 10);
      patient = new Patient({
        name: 'Test Patient',
        email: testPatientEmail,
        password: hashedPassword,
        phone: '1234567890',
        gender: 'male',
        bloodType: 'O+'
      });
      await patient.save();
      console.log('✅ Test patient created:', patient.email);
    } else {
      console.log('✅ Test patient already exists:', patient.email);
    }

    // Check if test doctor exists
    const testDoctorEmail = 'doctor@gmail.com';
    let doctor = await Doctor.findOne({ email: testDoctorEmail });

    if (!doctor) {
      console.log('Creating test doctor...');
      doctor = new Doctor({
        email: testDoctorEmail,
        password: 'health123',
        name: 'Dr. Healthcare Administrator'
      });
      await doctor.save();
      console.log('✅ Test doctor created:', doctor.email);
    } else {
      console.log('✅ Test doctor already exists:', doctor.email);
    }

    console.log('\n✅ Test data initialized successfully!');
    console.log('\nTest Credentials:');
    console.log('Patient - Email: patient@gmail.com, Password: patient123');
    console.log('Doctor - Email: doctor@gmail.com, Password: health123');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    process.exit(1);
  }
}

initTestData();
