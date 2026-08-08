const Patient = require('../models/Patient');
const Tablet = require('../models/Tablet');
const Vaccination = require('../models/Vaccination');
const QRCode = require('../models/QRCode');

// Get patient details by health ID
exports.getPatientByHealthId = async (req, res) => {
  try {
    const { healthId } = req.params;
    // Only return non-sensitive public fields for the QR scanner (no password/email)
    const patient = await Patient.findOne({ healthId }).select('healthId name phone dateOfBirth gender bloodType allergies medicalHistory createdAt');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const tablets = await Tablet.find({ patientId: patient._id }).select('-patientId -__v');
    const vaccinations = await Vaccination.find({ patientId: patient._1d }).select('-patientId -__v');

    // Ensure vaccination compatibility (some records may use different field names)
    // and convert any dates to ISO strings when necessary in the response serializer below.

    res.json({ patient, tablets, vaccinations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// Get patient dashboard info
exports.getDashboard = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await Patient.findById(patientId).select('-password');

    const tablets = await Tablet.find({ patientId });
    const vaccinations = await Vaccination.find({ patientId });
    const qrCode = await QRCode.findOne({ patientId });

    res.json({
      patient,
      tablets,
      vaccinations,
      qrCode
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
};
// Update patient profile
// Update patient profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allowed fields to update
    const allowedFields = [
      'name',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'bloodType',
      'allergies',
      'address',
      'city',
      'medicalHistory'
    ];

    // Filter updates to only include allowed fields
    const filteredUpdates = {};
    
    for (let field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    const patient = await Patient.findByIdAndUpdate(
      id, 
      { ...filteredUpdates, updatedAt: new Date() }, 
      { new: true }
    ).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json({ message: 'Patient profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient profile', error: error.message });
  }
};

// Add vaccination details
exports.addVaccinationDetails = async (req, res) => {
  try {
    const { patientId, completedVaccinations = [], futureVaccinations = [] } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required' });
    }

    // Basic payload validation
    const validateEntries = (arr, dateKey) => arr.every(item => item && item.name && (item[dateKey] || item.date));
    if (!Array.isArray(completedVaccinations) || !Array.isArray(futureVaccinations)) {
      return res.status(400).json({ success: false, message: 'Invalid vaccination arrays' });
    }

    if (!validateEntries(completedVaccinations, 'date')) {
      return res.status(400).json({ success: false, message: 'Completed vaccinations must have name and date' });
    }

    if (!validateEntries(futureVaccinations, 'scheduledDate')) {
      return res.status(400).json({ success: false, message: 'Future vaccinations must have name and scheduledDate' });
    }

    const vaccination = new Vaccination({
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
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding vaccinations', 
      error: error.message 
    });
  }
};

// Update vaccination details
exports.updateVaccinationDetails = async (req, res) => {
  try {
    const { patientId, completedVaccinations = [], futureVaccinations = [] } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required' });
    }

    if (!Array.isArray(completedVaccinations) || !Array.isArray(futureVaccinations)) {
      return res.status(400).json({ success: false, message: 'Invalid vaccination arrays' });
    }

    const vaccination = await Vaccination.findOneAndUpdate(
      { patientId },
      {
        completedVaccinations,
        futureVaccinations,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!vaccination) {
      return res.status(404).json({ message: 'Vaccination record not found' });
    }

    res.json({ 
      success: true,
      message: 'Vaccinations updated successfully', 
      vaccination 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating vaccinations', 
      error: error.message 
    });
  }
};