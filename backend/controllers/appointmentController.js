const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
// Emit socket events to notify clients when appointments change
const socketHelper = require('../socket');
const getIo = () => socketHelper.getIo();


exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

    // Validate required fields
    if (!patientId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: 'Patient ID, date, and time are required',
        error: 'Missing required fields'
      });
    }

    const appointment = new Appointment({
      patientId,
      doctorId: doctorId || null, // Allow null doctorId
      appointmentDate,
      appointmentTime,
      reason,
      status: 'scheduled'
    });

    await appointment.save();
    
    // Populate the appointment before sending response
    const populatedAppointment = await appointment.populate('patientId', 'name email healthId');
    
    // Emit real-time update
    const _io = getIo();
    if (_io) _io.emit('appointments-updated', { appointment: populatedAppointment, patientId: appointment.patientId });
    
    res.status(201).json({ 
      message: 'Appointment created successfully', 
      appointment: populatedAppointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name email specialization')
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    let appointments;
    
    // Special case for fixed doctor login (doctorId = 'doctor-1')
    // Show all appointments since it's an admin doctor account
    if (doctorId === 'doctor-1') {
      appointments = await Appointment.find()
        .populate('patientId', 'name email healthId')
        .populate('doctorId', 'name email')
        .sort({ appointmentDate: -1 });
    } else {
      // For regular doctor accounts, show only their appointments
      appointments = await Appointment.find({ doctorId })
        .populate('patientId', 'name email healthId')
        .sort({ appointmentDate: -1 });
    }

    res.json(appointments || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: scheduled, completed, or cancelled' 
      });
    }

    // Update the appointment status (don't delete it)
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status, notes, updatedAt: Date.now() },
      { new: true }
    ).populate('patientId', 'name email healthId').populate('doctorId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Emit real-time update
    const _io = getIo();
    if (_io) _io.emit('appointments-updated', { appointment, patientId: appointment.patientId });

    res.json({ 
      message: 'Appointment updated successfully', 
      appointment 
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Mark appointment as cancelled (don't delete it)
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    ).populate('patientId', 'name email healthId').populate('doctorId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Emit real-time update
    const _io = getIo();
    if (_io) _io.emit('appointments-updated', { appointment, patientId: appointment.patientId });

    res.json({ 
      message: 'Appointment cancelled successfully', 
      appointment 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
  }
};

exports.getBookedAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name healthId email phone')
      .populate('doctorId', 'name email')
      .sort({ appointmentDate: 1 })
      .lean();

    res.json({
      success: true,
      appointments: appointments || [],
      total: (appointments || []).length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching booked appointments', 
      error: error.message 
    });
  }
};