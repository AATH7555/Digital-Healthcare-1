const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const appointments = await Appointment.find().limit(50).lean();

    for (const apt of appointments) {
      const patient = await Patient.findById(apt.patientId).select('name email healthId').lean().catch(() => null);
      const doctor = await Doctor.findById(apt.doctorId).select('name email').lean().catch(() => null);
      console.log('Appointment', apt._id);
      console.log('  patientId:', apt.patientId, '->', patient ? patient.name : '(not found)');
      console.log('  doctorId :', apt.doctorId, '->', doctor ? doctor.name : '(not found)');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
