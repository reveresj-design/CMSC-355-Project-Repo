const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// We are adding a new schema for the administration events
const administrationSchema = new Schema({
  administeredBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const medicationSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  recipientName: { type: String, required: true },
  administrations: [administrationSchema]
}, { timestamps: true });

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;