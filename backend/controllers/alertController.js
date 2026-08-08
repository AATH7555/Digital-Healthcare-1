const HealthAlert = require('../models/HealthAlert');

exports.createAlert = async (req, res) => {
  try {
    const { patientId, alertType, title, message, dueDate } = req.body;

    const alert = new HealthAlert({
      patientId,
      alertType,
      title,
      message,
      dueDate
    });

    await alert.save();
    res.status(201).json({ message: 'Alert created successfully', alert });
  } catch (error) {
    res.status(500).json({ message: 'Error creating alert', error: error.message });
  }
};

exports.getPatientAlerts = async (req, res) => {
  try {
    const { patientId } = req.params;
    const alerts = await HealthAlert.find({ patientId }).sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
};

exports.markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await HealthAlert.findByIdAndUpdate(
      alertId,
      { isRead: true },
      { new: true }
    );

    res.json({ message: 'Alert marked as read', alert });
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert', error: error.message });
  }
};

exports.getUnreadAlertCount = async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await HealthAlert.countDocuments({ patientId, isRead: false });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alert count', error: error.message });
  }
};
