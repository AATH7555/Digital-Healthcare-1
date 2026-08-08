const MedicalReport = require('../models/MedicalReport');

exports.createReport = async (req, res) => {
  try {
    const { patientId, doctorId, reportType, title, description, findings, recommendations } = req.body;

    const report = new MedicalReport({
      patientId,
      doctorId,
      reportType,
      title,
      description,
      findings,
      recommendations
    });

    await report.save();
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
};

exports.getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await MedicalReport.find({ patientId })
      .populate('doctorId', 'name email specialization')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

exports.getDoctorReports = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reports = await MedicalReport.find({ doctorId })
      .populate('patientId', 'name email healthId')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};
