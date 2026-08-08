// Utility functions for health data formatting

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const generateHealthId = () => {
  const randomNum = Math.floor(Math.random() * 10000);
  return `health${String(randomNum).padStart(4, '0')}`;
};

export const calculateDaysUntil = (futureDate) => {
  const today = new Date();
  const future = new Date(futureDate);
  const timeDiff = future - today;
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Patient-specific email validation: require a valid email format
export const validatePatientEmail = (email) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  // basic format check - accept any valid email domain
  return validateEmail(normalized);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const getVaccinationStatus = (status) => {
  const statusMap = {
    completed: { color: '#2e7d32', label: 'Completed' },
    pending: { color: '#f57c00', label: 'Pending' },
    scheduled: { color: '#1976d2', label: 'Scheduled' }
  };
  return statusMap[status] || { color: '#999', label: 'Unknown' };
};

export const formatHealthData = (patient, tablets, vaccinations) => {
  return {
    patient: {
      name: patient.name,
      email: patient.email,
      healthId: patient.healthId
    },
    medications: tablets.map(t => ({
      name: t.tabletName,
      dosage: t.dosage,
      schedule: t.schedule
    })),
    vaccinations: vaccinations.map(v => ({
      name: v.vaccinationName,
      status: v.status
    }))
  };
};

export const generateWeeklyReport = (items) => {
  const weeks = {};
  items.forEach(item => {
    const week = Math.floor(new Date(item.date).getDate() / 7);
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(item);
  });
  return weeks;
};
