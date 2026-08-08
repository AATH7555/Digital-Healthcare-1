const UserProfile = require('../models/UserProfile');

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { userId, userType, phone, dateOfBirth, gender, bloodType, allergies, address, city, state, zipCode, specialization, medicalLicense, hospitalAffiliation, yearsOfExperience, emergencyContact } = req.body;

    let profile = await UserProfile.findOne({ userId });

    if (profile) {
      profile = await UserProfile.findByIdAndUpdate(profile._id, {
        phone,
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        address,
        city,
        state,
        zipCode,
        specialization,
        medicalLicense,
        hospitalAffiliation,
        yearsOfExperience,
        emergencyContact,
        updatedAt: Date.now()
      }, { new: true });
    } else {
      profile = new UserProfile({
        userId,
        userType,
        phone,
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        address,
        city,
        state,
        zipCode,
        specialization,
        medicalLicense,
        hospitalAffiliation,
        yearsOfExperience,
        emergencyContact
      });
      await profile.save();
    }

    res.json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
