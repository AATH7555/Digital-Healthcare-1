const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require(path.join(__dirname, '..', 'models', 'Patient'));
const Vaccination = require(path.join(__dirname, '..', 'models', 'Vaccination'));

async function markFirstScheduledAsCompleted() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare');
    console.log('✅ Connected to MongoDB');

    const patient = await Patient.findOne();
    if (!patient) {
      console.error('No patient found');
      process.exit(1);
    }

    const vaccination = await Vaccination.findOne({ patientId: patient._id });
    if (!vaccination) {
      console.error('No vaccination record found for patient');
      process.exit(1);
    }

    if (!vaccination.futureVaccinations || vaccination.futureVaccinations.length === 0) {
      console.error('No future vaccinations to mark as completed');
      process.exit(1);
    }

    // Move the first future vaccination to completed
    const future = vaccination.futureVaccinations.shift();
    const completedEntry = {
      name: future.name,
      date: future.scheduledDate || new Date(),
      time: future.time || undefined,
      location: future.location || undefined
    };

    vaccination.completedVaccinations.push(completedEntry);
    vaccination.updatedAt = new Date();

    await vaccination.save();

    console.log('✅ Marked scheduled vaccination as completed');
    console.log('Remaining future vaccinations:', vaccination.futureVaccinations.length);
    console.log('Completed vaccinations:', vaccination.completedVaccinations.length);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

markFirstScheduledAsCompleted();