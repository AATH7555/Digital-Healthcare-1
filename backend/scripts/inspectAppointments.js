const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const appointments = await Appointment.find().limit(50).lean();
    console.log(JSON.stringify(appointments, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
