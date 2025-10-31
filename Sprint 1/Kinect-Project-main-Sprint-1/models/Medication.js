// FileName: Medication.js
// Description: Mongoose model for medication w/ a sub-schema 
// for administration history.

// Imports.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Administration schema
const administrationSchema = new Schema({
  administeredBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

//Medication schema
const medicationSchema = new Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  recipientName: { type: String, required: true },
  group: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  administrations: [administrationSchema]
}, { timestamps: true });

const Medication = mongoose.model('Medication', medicationSchema);

//Exporting
module.exports = Medication;