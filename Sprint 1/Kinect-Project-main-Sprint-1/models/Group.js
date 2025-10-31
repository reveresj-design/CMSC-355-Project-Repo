// FileName: Group.js
// Description: Mongoose model for 'Group'. Defines the schema such as name,
// members, and a unique invite code.

// Imports.
const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid'); // For generating unique invite codes.
const Schema = mongoose.Schema;

// Defines the schema for groups in the database.
const groupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { 
    type: String,
    required: true,
    unique: true,
    // Generates invite code.
    default: () => customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)()
  },
}, { timestamps: true }); 

// Creates the Group model from the schema.
const Group = mongoose.model('Group', groupSchema);

// Exporting.
module.exports = Group;