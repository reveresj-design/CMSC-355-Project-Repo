// FileName: User.js
// Description: Mongoose model for 'User'. Defines the schema including 
// username, email, password, and a reference to their group.

// Imports.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//User information
const userSchema = new Schema({
  username: { 
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  group: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

//Exporting
module.exports = User;