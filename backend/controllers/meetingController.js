const Meeting = require('../models/Meeting');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const socketHelper = require('../socket');
const getIo = () => socketHelper.getIo();

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const { patientId, doctorId, meetLink, meetDate, meetTime, notes } = req.body;

    if (!patientId || !doctorId || !meetLink || !meetDate || !meetTime) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient ID, Doctor ID, Meet Link, Date, and Time are required'
      });
    }

    const meeting = new Meeting({
      patientId,
      doctorId,
      meetLink,
      meetDate,
      meetTime,
      notes,
      status: 'scheduled'
    });

    await meeting.save();

    // Populate patient and doctor
    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('patientId', 'name email healthId')
      .populate('doctorId', 'name email specialization department');

    // Emit real-time updates
    const ioInstance = getIo();
    if (ioInstance) {
      // Notify components listening to appointments-updated or general patient-data-updated
      ioInstance.emit('appointments-updated', { patientId });
      ioInstance.emit('patient-data-updated', { patientId });
    }

    res.status(201).json({
      success: true,
      message: 'Google Meet scheduled successfully',
      meeting: populatedMeeting
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, message: 'Error scheduling meeting', error: error.message });
  }
};

// Get meetings for a patient
exports.getPatientMeetings = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const meetings = await Meeting.find({ patientId })
      .populate('doctorId', 'name email specialization department location')
      .sort({ meetDate: 1, meetTime: 1 });

    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Error fetching patient meetings:', error);
    res.status(500).json({ success: false, message: 'Error fetching meetings', error: error.message });
  }
};

// Get meetings for a doctor (or all if admin)
exports.getDoctorMeetings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    let meetings;

    if (doctorId === 'doctor-1') {
      // Admin doctor - show all meetings
      meetings = await Meeting.find()
        .populate('patientId', 'name email healthId')
        .populate('doctorId', 'name email specialization')
        .sort({ meetDate: 1, meetTime: 1 });
    } else {
      meetings = await Meeting.find({ doctorId })
        .populate('patientId', 'name email healthId')
        .populate('doctorId', 'name email specialization')
        .sort({ meetDate: 1, meetTime: 1 });
    }

    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Error fetching doctor meetings:', error);
    res.status(500).json({ success: false, message: 'Error fetching meetings', error: error.message });
  }
};

// Delete/cancel a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findByIdAndDelete(meetingId);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    // Emit real-time updates
    const ioInstance = getIo();
    if (ioInstance) {
      ioInstance.emit('appointments-updated', { patientId: meeting.patientId });
      ioInstance.emit('patient-data-updated', { patientId: meeting.patientId });
    }

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, message: 'Error deleting meeting', error: error.message });
  }
};
