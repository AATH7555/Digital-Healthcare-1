const Tablet = require('../models/Tablet');
const Vaccination = require('../models/Vaccination');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const QRCode = require('../models/QRCode');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    let doctors = await Doctor.find().select('-password');
    
    // If no doctors exist, create test doctors
    if (doctors.length === 0) {
      const testDoctors = [
        {
          name: 'Dr. John Smith',
          email: 'john.smith@hospital.com',
          specialization: 'General Practice',
          phone: '+1-555-0101',
          department: 'General Medicine',
          location: 'Main Clinic',
          password: 'password123'
        },
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          specialization: 'Cardiology',
          phone: '+1-555-0102',
          department: 'Cardiology',
          location: 'Heart Care Wing',
          password: 'password123'
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hospital.com',
          specialization: 'Pediatrics',
          phone: '+1-555-0103',
          department: 'Children\'s Health',
          location: 'Kids Clinic',
          password: 'password123'
        }
      ];

      doctors = await Doctor.insertMany(testDoctors);
      console.log('✅ Test doctors created:', doctors.length);
    }

    res.json(doctors.map(d => d.toObject ? { ...d.toObject(), password: undefined } : d));
  } catch (error) {
    console.error('Error fetching/creating doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// Get all patients for quick access
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select('_id name email healthId dateOfBirth bloodType')
      .lean();
    
    res.json({
      success: true,
      patients: patients,
      total: patients.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching patients', 
      error: error.message 
    });
  }
};

// Add tablet info
exports.addTablet = async (req, res) => {
  try {
    const { patientId, tabletName, dosage, schedule, startDate, endDate } = req.body;

    const tablet = new Tablet({
      patientId,
      tabletName,
      dosage,
      schedule,
      startDate,
      endDate
    });

    await tablet.save();
    res.status(201).json({ message: 'Tablet added successfully', tablet });
  } catch (error) {
    res.status(500).json({ message: 'Error adding tablet', error: error.message });
  }
};

// Update tablet info
exports.updateTablet = async (req, res) => {
  try {
    const { tabletId } = req.params;
    const updates = req.body;

    const tablet = await Tablet.findByIdAndUpdate(tabletId, updates, { new: true });
    res.json({ message: 'Tablet updated successfully', tablet });
  } catch (error) {
    res.status(500).json({ message: 'Error updating tablet', error: error.message });
  }
};

// Add vaccination info
exports.addVaccination = async (req, res) => {
  try {
    const { patientId, vaccinationName, vaccinationDetails, futureVaccinations } = req.body;

    const vaccination = new Vaccination({
      patientId,
      vaccinationName,
      status: 'scheduled',
      vaccinationDetails,
      futureVaccinations
    });

    await vaccination.save();
    res.status(201).json({ message: 'Vaccination added successfully', vaccination });
  } catch (error) {
    res.status(500).json({ message: 'Error adding vaccination', error: error.message });
  }
};

// Update vaccination info
exports.updateVaccination = async (req, res) => {
  try {
    const { vaccinationId } = req.params;
    const updates = req.body;

    const vaccination = await Vaccination.findByIdAndUpdate(vaccinationId, updates, { new: true });
    res.json({ message: 'Vaccination updated successfully', vaccination });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vaccination', error: error.message });
  }
};

// Generate QR Code
exports.generateQRCode = async (req, res) => {
  try {
    const { patientId } = req.params;
    const QRCode = require('qrcode');


    const patient = await Patient.findById(patientId).lean();
    const tablets = await Tablet.find({ patientId }).lean();
    // Get the latest vaccination record for this patient
    const vaccination = await Vaccination.findOne({ patientId }).lean();

    const qrData = {
      healthId: patient.healthId,
      name: patient.name,
      email: patient.email,
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      medicalHistory: patient.medicalHistory,
      tablets: tablets.map(t => ({
        name: t.tabletName,
        dosage: t.dosage,
        schedule: t.schedule,
        startDate: t.startDate,
        endDate: t.endDate
      })),
      completedVaccinations: vaccination && vaccination.completedVaccinations ? vaccination.completedVaccinations : [],
      futureVaccinations: vaccination && vaccination.futureVaccinations ? vaccination.futureVaccinations : []
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    res.json({
      message: 'QR Code generated successfully',
      qrCode,
      data: qrData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
};

// Scan QR Code
exports.scanQRCode = async (req, res) => {
  try {
    const { qrCodeData, doctorId } = req.body;
    const data = JSON.parse(qrCodeData);

    const qrRecord = await QRCode.findOne({ healthId: data.healthId });
    if (qrRecord) {
      qrRecord.scannedBy.push(doctorId);
      qrRecord.lastScanned = new Date();
      await qrRecord.save();
    }

    res.json({
      message: 'QR Code scanned successfully',
      patientData: data
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning QR code', error: error.message });
  }
};

// Update patient details (by doctor)
exports.updatePatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowedFields = [
      'phone',
      'dateOfBirth',
      'gender',
      'bloodType',
      'allergies',
      'medicalHistory'
    ];

    // Filter updates to only include allowed fields
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Update the patient record
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient details updated successfully',
      patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient details', error: error.message });
  }
};

// Get patient details for doctor
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).select('-password');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const tablets = await Tablet.find({ patientId });
    const vaccinations = await Vaccination.find({ patientId });

    res.json({
      patient,
      tablets,
      vaccinations
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient details', error: error.message });
  }
};
// Add/Update medication (daily or weekly)
exports.addMedication = async (req, res) => {
  try {
    const { patientId, medicationType, tablets, startDate, endDate } = req.body;

    const medication = new Tablet({
      patientId,
      medicationType,
      tablets, // Array of {name, time, date} for daily or {name, time} for weekly
      startDate,
      endDate,
      createdAt: new Date()
    });

    await medication.save();
    res.status(201).json({ 
      success: true,
      message: 'Medication saved successfully', 
      medication 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding medication', 
      error: error.message 
    });
  }
};

// Add/Update vaccination (completed and future)
exports.addVaccinationDetails = async (req, res) => {
  try {
    const { patientId, completedVaccinations, futureVaccinations } = req.body;

    // Try to find an existing vaccination record for this patient
    let vaccination = await Vaccination.findOne({ patientId });
    if (vaccination) {
      // Update existing record
      vaccination.completedVaccinations = completedVaccinations;
      vaccination.futureVaccinations = futureVaccinations;
      vaccination.updatedAt = new Date();
      await vaccination.save();
      res.status(200).json({
        success: true,
        message: 'Vaccinations updated successfully',
        vaccination
      });
    } else {
      // Create new record
      vaccination = new Vaccination({
        patientId,
        completedVaccinations,
        futureVaccinations,
        createdAt: new Date()
      });
      await vaccination.save();
      res.status(201).json({
        success: true,
        message: 'Vaccinations saved successfully',
        vaccination
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding/updating vaccinations',
      error: error.message
    });
  }
};

// Get all booked appointments
exports.getBookedAppointments = async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    
    const appointments = await Appointment.find()
      .populate('patientId', 'name healthId email')
      .populate('doctorId', 'name email')
      .sort({ appointmentDate: 1 }) // Sort by date ascending (earliest first)
      .lean();

    res.json({
      success: true,
      appointments: appointments || [],
      total: (appointments || []).length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching appointments', 
      error: error.message 
    });
  }
};