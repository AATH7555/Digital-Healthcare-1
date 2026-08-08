const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Tablet = require('../models/Tablet');
const Vaccination = require('../models/Vaccination');
const Appointment = require('../models/Appointment');
const HealthAlert = require('../models/HealthAlert');
const UserProfile = require('../models/UserProfile');

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Database Connection Successful');
    console.log('🗄️ Starting database initialization...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Tablet.deleteMany({}),
      Vaccination.deleteMany({}),
      Appointment.deleteMany({}),
      HealthAlert.deleteMany({}),
      UserProfile.deleteMany({})
    ]);

    // Create sample patients
    console.log('👥 Creating sample patients...');
    const samplePatients = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcryptjs.hash('password123', 10),
        phone: '9876543210',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        bloodType: 'O+',
        allergies: ['Penicillin'],
        medicalHistory: ['High Blood Pressure', 'Diabetes']
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcryptjs.hash('password123', 10),
        phone: '9876543211',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'female',
        bloodType: 'A+',
        allergies: ['Aspirin'],
        medicalHistory: []
      },
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: await bcryptjs.hash('password123', 10),
        phone: '9876543212',
        dateOfBirth: new Date('1992-03-10'),
        gender: 'male',
        bloodType: 'B+',
        allergies: [],
        medicalHistory: ['Asthma']
      }
    ];

    const createdPatients = await Patient.insertMany(samplePatients);
    console.log(`✅ Created ${createdPatients.length} patients`);

    // Create sample doctors
    console.log('👨‍⚕️ Creating sample doctors...');
    const sampleDoctors = [
      {
        name: 'Dr. James Smith',
        email: 'doctor.james@example.com',
        password: await bcryptjs.hash('password123', 10),
        medicalLicense: 'DL001',
        specialization: 'Cardiologist',
        hospitalAffiliation: 'City Medical Hospital',
        yearsOfExperience: 15,
        phone: '9876543220'
      },
      {
        name: 'Dr. Emily Brown',
        email: 'doctor.emily@example.com',
        password: await bcryptjs.hash('password123', 10),
        medicalLicense: 'DL002',
        specialization: 'Pediatrician',
        hospitalAffiliation: 'Children\'s Hospital',
        yearsOfExperience: 10,
        phone: '9876543221'
      },
      {
        name: 'Dr. Robert Lee',
        email: 'doctor.robert@example.com',
        password: await bcryptjs.hash('password123', 10),
        medicalLicense: 'DL003',
        specialization: 'General Practitioner',
        hospitalAffiliation: 'Central Health Center',
        yearsOfExperience: 20,
        phone: '9876543222'
      }
    ];

    const createdDoctors = await Doctor.insertMany(sampleDoctors);
    console.log(`✅ Created ${createdDoctors.length} doctors`);

    // Create sample medications
    console.log('💊 Creating sample medications...');
    const sampleTablets = [
      {
        patientId: createdPatients[0]._id,
        tabletName: 'Lisinopril',
        dosage: '10mg',
        schedule: [{ day: 'Monday', time: '08:00' }, { day: 'Wednesday', time: '08:00' }, { day: 'Friday', time: '08:00' }],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      {
        patientId: createdPatients[0]._id,
        tabletName: 'Metformin',
        dosage: '500mg',
        schedule: [{ day: 'Monday', time: '09:00' }, { day: 'Wednesday', time: '09:00' }, { day: 'Friday', time: '09:00' }],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      {
        patientId: createdPatients[1]._id,
        tabletName: 'Vitamin D3',
        dosage: '2000IU',
        schedule: [{ day: 'Monday', time: '10:00' }, { day: 'Friday', time: '10:00' }],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      }
    ];

    const createdTablets = await Tablet.insertMany(sampleTablets);
    console.log(`✅ Created ${createdTablets.length} medications`);

    // Create sample vaccinations
    console.log('💉 Creating sample vaccinations...');
    const sampleVaccinations = [
      {
        patientId: createdPatients[0]._id,
        vaccinationName: 'COVID-19 (Booster)',
        status: 'completed',
        vaccinationDetails: [{ date: new Date('2024-01-15'), time: '10:00', location: 'City Medical Hospital' }],
        futureVaccinations: [{ name: 'Influenza', scheduledDate: new Date('2024-10-01') }]
      },
      {
        patientId: createdPatients[1]._id,
        vaccinationName: 'Flu Shot',
        status: 'pending',
        vaccinationDetails: [{ date: new Date('2024-02-20'), time: '14:00', location: 'Community Health Center' }],
        futureVaccinations: []
      },
      {
        patientId: createdPatients[2]._id,
        vaccinationName: 'COVID-19 (First Dose)',
        status: 'completed',
        vaccinationDetails: [{ date: new Date('2024-01-10'), time: '11:00', location: 'Central Health Center' }],
        futureVaccinations: [{ name: 'COVID-19 (Second Dose)', scheduledDate: new Date('2024-02-10') }]
      }
    ];

    const createdVaccinations = await Vaccination.insertMany(sampleVaccinations);
    console.log(`✅ Created ${createdVaccinations.length} vaccinations`);

    // Create sample appointments
    console.log('📅 Creating sample appointments...');
    const sampleAppointments = [
      {
        patientId: createdPatients[0]._id,
        doctorId: createdDoctors[0]._id,
        appointmentDate: new Date('2024-02-15'),
        appointmentTime: '10:00',
        reason: 'Regular checkup for heart health',
        status: 'scheduled'
      },
      {
        patientId: createdPatients[1]._id,
        doctorId: createdDoctors[1]._id,
        appointmentDate: new Date('2024-02-20'),
        appointmentTime: '14:30',
        reason: 'Child vaccination follow-up',
        status: 'scheduled'
      },
      {
        patientId: createdPatients[2]._id,
        doctorId: createdDoctors[2]._id,
        appointmentDate: new Date('2024-02-18'),
        appointmentTime: '09:00',
        reason: 'General health examination',
        status: 'completed'
      }
    ];

    const createdAppointments = await Appointment.insertMany(sampleAppointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // Create sample health alerts
    console.log('🔔 Creating sample health alerts...');
    const sampleAlerts = [
      {
        patientId: createdPatients[0]._id,
        alertType: 'medication-reminder',
        title: 'Time to take your Lisinopril',
        message: 'Don\'t forget to take your 10mg Lisinopril today',
        dueDate: new Date(),
        isRead: false
      },
      {
        patientId: createdPatients[1]._id,
        alertType: 'vaccination-due',
        title: 'Flu Shot Available',
        message: 'You are eligible for your annual flu shot',
        dueDate: new Date(),
        isRead: false
      },
      {
        patientId: createdPatients[2]._id,
        alertType: 'appointment-reminder',
        title: 'Appointment Tomorrow',
        message: 'Your appointment with Dr. Robert Lee is tomorrow at 9:00 AM',
        dueDate: new Date(),
        isRead: true
      }
    ];

    const createdAlerts = await HealthAlert.insertMany(sampleAlerts);
    console.log(`✅ Created ${createdAlerts.length} health alerts`);

    // Create sample user profiles
    console.log('👤 Creating sample user profiles...');
    const sampleProfiles = [
      {
        userId: createdPatients[0]._id,
        userType: 'patient',
        phone: '9876543210',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        bloodType: 'O+',
        address: '123 Main St',
        city: 'Springfield',
        state: 'Illinois',
        zipCode: '62701',
        allergies: ['Penicillin'],
        emergencyContact: { name: 'Jane Doe', phone: '9876543230', relation: 'Wife' }
      },
      {
        userId: createdDoctors[0]._id,
        userType: 'doctor',
        phone: '9876543220',
        specialization: 'Cardiologist',
        medicalLicense: 'DL001',
        hospitalAffiliation: 'City Medical Hospital',
        yearsOfExperience: 15
      }
    ];

    const createdProfiles = await UserProfile.insertMany(sampleProfiles);
    console.log(`✅ Created ${createdProfiles.length} user profiles`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE INITIALIZATION COMPLETE!');
    console.log('='.repeat(50));
    console.log(`\n📊 Data Summary:`);
    console.log(`   Patients: ${createdPatients.length}`);
    console.log(`   Doctors: ${createdDoctors.length}`);
    console.log(`   Medications: ${createdTablets.length}`);
    console.log(`   Vaccinations: ${createdVaccinations.length}`);
    console.log(`   Appointments: ${createdAppointments.length}`);
    console.log(`   Health Alerts: ${createdAlerts.length}`);
    console.log(`   User Profiles: ${createdProfiles.length}`);
    console.log('\n📝 Sample Login Credentials:');
    console.log('   Patient Email: john@example.com');
    console.log('   Patient Password: password123');
    console.log('   Doctor Email: doctor.james@example.com');
    console.log('   Doctor Password: password123');
    console.log('\n💾 All data is now stored in MongoDB!');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
