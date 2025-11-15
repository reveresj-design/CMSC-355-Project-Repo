// FileName: medications.js
// Description: Definitions for medication management
// and administration history.

//Imports
const express = require('express');
const Medication = require('../models/Medication');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Getting medications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.group) {
      return res.json([]); 
    }
    const medications = await Medication.find({ group: user.group }).sort({ createdAt: -1 });
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Posting new medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, recipientName } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user.group) {
      return res.status(400).json({ msg: 'User does not belong to a group' });
    }
    const newMedication = new Medication({
      name,
      dosage,
      recipientName,
      group: user.group
    });
    const medication = await newMedication.save();
    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Updating medication by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, dosage, recipientName } = req.body; 
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { name, dosage, recipientName }, 
      { new: true }
    );
    if (!updatedMedication) {
      return res.status(404).json({ msg: 'Medication not found' });
    }
    res.json(updatedMedication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Updating given administration event.
router.put('/:medId/administrations/:adminId', auth, async (req, res) => {
  try {
    const { medId, adminId } = req.params;
    const { administeredBy, timestamp } = req.body; 

    const medication = await Medication.findById(medId);
    if (!medication) {
      return res.status(404).json({ msg: 'Medication not found' });
    }
    const adminEvent = medication.administrations.id(adminId);
    if (!adminEvent) {
      return res.status(404).json({ msg: 'Administration event not found' });
    }
    adminEvent.administeredBy = administeredBy;
    if (timestamp) {
      adminEvent.timestamp = timestamp;
    }
    await medication.save();
    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a medication by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ msg: 'Medication not found' });
    }
    await medication.deleteOne();
    res.json({ msg: 'Medication removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add an administration event to medication
router.post('/:id/administer', auth, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found'});
    }
    const adminName = user.username || user.email;
    medication.administrations.push({ administeredBy: adminName });
    await medication.save();
    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete a specific administration event
router.delete('/:medId/administrations/:adminId', auth, async (req, res) => {
    try {
      const { medId, adminId } = req.params;
      const medication = await Medication.findById(medId);
      if (!medication) {
        return res.status(404).json({ msg: 'Medication not found' });
      }
      medication.administrations.pull({ _id: adminId });
      await medication.save();
      res.json(medication);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

//Exporting
module.exports = router;