const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Tablet = require('../models/Tablet');
const Vaccination = require('../models/Vaccination');
const Appointment = require('../models/Appointment');
const HealthAlert = require('../models/HealthAlert');
const UserProfile = require('../models/UserProfile');
const MedicalReport = require('../models/MedicalReport');

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🗄️ Connected to MongoDB');
    console.log('🧹 Clearing all collections...\n');

    const collections = [
      { name: 'Patients', model: Patient },
      { name: 'Doctors', model: Doctor },
      { name: 'Tablets', model: Tablet },
      { name: 'Vaccinations', model: Vaccination },
      { name: 'Appointments', model: Appointment },
      { name: 'Health Alerts', model: HealthAlert },
      { name: 'User Profiles', model: UserProfile },
      { name: 'Medical Reports', model: MedicalReport }
    ];

    let totalDeleted = 0;

    for (const collection of collections) {
      const result = await collection.model.deleteMany({});
      console.log(`✅ ${collection.name}: ${result.deletedCount} records deleted`);
      totalDeleted += result.deletedCount;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ DATABASE CLEARED`);
    console.log(`Total records deleted: ${totalDeleted}`);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDatabase();
