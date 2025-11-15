// FileName: appointments.js
// Description: Defines router for appointment API. Defines user operations for posting, 
// updating, and deleting appointments by ID

// Imports.
const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get appointments for the user group
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.group) {
      return res.json([]); 
    }
    const appointments = await Appointment.find({ group: user.group }).sort({ start: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.group) {
        return res.status(400).json({ msg: 'User does not belong to a group' });
    }

    const newAppointment = new Appointment({
        ...req.body,
        group: user.group,
        createdBy: user.username || user.email 
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: 'Error creating appointment' });
  }
});

// Update an appointment by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: 'Error updating appointment' });
  }
});

// Delete an appointment by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark appointment as completed
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

//Exporting
module.exports = router;