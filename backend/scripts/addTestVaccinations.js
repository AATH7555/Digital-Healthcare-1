const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Patient = require(path.join(__dirname, '..', 'models', 'Patient'));
const Vaccination = require(path.join(__dirname, '..', 'models', 'Vaccination'));

async function addTestVaccinations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare');
    console.log('✅ Connected to MongoDB');

    // Find a patient (use the first patient or create test data)
    let patient = await Patient.findOne();
    
    if (!patient) {
      console.log('❌ No patients found. Please create a patient first.');
      process.exit(1);
    }

    console.log(`📝 Adding vaccinations for patient: ${patient.name} (${patient.healthId})`);

    // Create test vaccination data
    const vaccination = new Vaccination({
      patientId: patient._id,
      completedVaccinations: [
        { name: 'COVID-19 (Dose 1)', date: new Date('2023-03-15'), time: '10:00 AM' },
        { name: 'COVID-19 (Dose 2)', date: new Date('2023-04-12'), time: '02:30 PM' },
        { name: 'Polio', date: new Date('2023-05-20'), time: '09:00 AM' },
        { name: 'Measles', date: new Date('2023-06-10'), time: '11:00 AM' }
      ],
      futureVaccinations: [
        { name: 'COVID-19 Booster', scheduledDate: new Date('2024-12-15') },
        { name: 'Tetanus', scheduledDate: new Date('2024-11-20') },
        { name: 'Hepatitis B', scheduledDate: new Date('2025-01-10') }
      ]
    });

    await vaccination.save();
    console.log('✅ Test vaccination data added successfully!');
    console.log(`\nVaccination Record Created:`);
    console.log(`- Completed Vaccinations: ${vaccination.completedVaccinations.length}`);
    console.log(`- Scheduled Vaccinations: ${vaccination.futureVaccinations.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestVaccinations();
