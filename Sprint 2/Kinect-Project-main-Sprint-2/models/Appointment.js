// Filename: Appointment.js
// Description: Mongoose model for 'Appointment'. Definitons for group/appointment
// schema.

// Imports.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defines the schema for appointments in the database.
const appointmentSchema = new Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  location: { type: String },
  doctorName: { type: String },
  purpose: { type: String },
  summary: { type: String },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); 

// Creates the Appointment model from the schema.
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Exporting.
module.exports = Appointment;