const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all appointments
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const newAppointment = new Appointment({
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      doctorName: req.body.doctorName,
      purpose: req.body.purpose,
      summary: req.body.summary,
    });
    const savedAppointment = await newAppointment.save();
    res.status(201).json(savedAppointment);
  } catch (err) {
    res.status(400).json({ message: 'Error creating appointment' });
  }
});

// We can add the update and delete logic later
router.put('/:id', auth, (req, res) => res.status(501).json({ message: 'Not yet implemented' }));
router.delete('/:id', auth, (req, res) => res.status(501).json({ message: 'Not yet implemented' }));


module.exports = router;