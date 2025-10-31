// FileName: users.js
// Description: Handler for user management: registration, login, 
// fetching user data, and account deletion.

//Imports
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Group = require('../models/Group'); 
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');
const router = express.Router();

// Registering a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }
    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log in a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const payload = { userId: user.id };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('group').select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete user account/data
router.delete('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.group) {
      await Medication.deleteMany({ group: user.group });
      await Appointment.deleteMany({ group: user.group });
    }
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'User account and associated data deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//Exporting
module.exports = router;