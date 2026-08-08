const express = require('express');
const {
  createOrUpdateProfile,
  getUserProfile
} = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, createOrUpdateProfile);
router.get('/:userId', authMiddleware, getUserProfile);

module.exports = router;
