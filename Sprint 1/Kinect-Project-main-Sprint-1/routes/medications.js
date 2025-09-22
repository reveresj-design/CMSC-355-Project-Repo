const express = require('express');
const Medication = require('../models/Medication');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all medications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    // In a multi-user system, you would filter medications by user ID
    // For now, we'll return all medications
    const medications = await Medication.find().sort({ createdAt: -1 });
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new medication
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, recipientName } = req.body; // <-- ADD recipientName
    const newMedication = new Medication({
      name,
      dosage,
      recipientName // <-- ADD recipientName
    });
    const medication = await newMedication.save();
    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT (update) a medication by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, dosage, recipientName } = req.body; // <-- ADD recipientName
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { name, dosage, recipientName }, // <-- ADD recipientName
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

// PUT: Update a specific administration event within a medication
router.put('/:medId/administrations/:adminId', auth, async (req, res) => {
  try {
    const { medId, adminId } = req.params;
    const { administeredBy } = req.body; // For now, we only allow editing the name

    const medication = await Medication.findById(medId);
    if (!medication) {
      return res.status(404).json({ msg: 'Medication not found' });
    }

    // Find the specific administration event in the array
    const adminEvent = medication.administrations.id(adminId);
    if (!adminEvent) {
      return res.status(404).json({ msg: 'Administration event not found' });
    }

    // Update the field and save the parent document
    adminEvent.administeredBy = administeredBy;
    await medication.save();

    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a medication by ID
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

// POST: Add an administration event to a specific medication
router.post('/:id/administer', auth, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Find the user from the token's payload to get their email
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found'});
    }
    
    medication.administrations.push({ administeredBy: user.email });
    
    await medication.save();
    res.json(medication);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;