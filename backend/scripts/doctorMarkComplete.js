const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require(path.join(__dirname, '..', 'models', 'Patient'));
const Vaccination = require(path.join(__dirname, '..', 'models', 'Vaccination'));

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare');
    const patient = await Patient.findOne();
    if (!patient) throw new Error('No patient found');

    let vaccination = await Vaccination.findOne({ patientId: patient._id });
    if (!vaccination) throw new Error('No vaccination record found');

    if (!vaccination.futureVaccinations || vaccination.futureVaccinations.length === 0) {
      console.log('No future vaccinations to test; adding one for test');
      vaccination.futureVaccinations.push({ name: 'Test Future', scheduledDate: new Date(Date.now() + 7*24*60*60*1000) });
      await vaccination.save();
      vaccination = await Vaccination.findOne({ patientId: patient._id });
    }

    const future = vaccination.futureVaccinations[0];

    // Build payload: move first future to completed
    const updatedScheduled = vaccination.futureVaccinations.slice(1).map(v => ({ name: v.name, scheduledDate: v.scheduledDate }));
    const updatedCompleted = (vaccination.completedVaccinations || []).map(v => ({ name: v.name, date: v.date }));
    updatedCompleted.push({ name: future.name, date: future.scheduledDate || new Date() });

    // Sign a doctor token
    const token = jwt.sign({ id: 'test-doctor-id', type: 'doctor' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const response = await axios.post(`${API_BASE}/doctors/vaccination-details`, {
      patientId: patient._id.toString(),
      completedVaccinations: updatedCompleted,
      futureVaccinations: updatedScheduled
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.error('Response data:', err.response.data);
  }
  process.exit(0);
}

run();