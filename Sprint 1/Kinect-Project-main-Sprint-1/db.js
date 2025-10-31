// FileName: db.js
// Description: Mongoose connection utility.

//Imports.
const mongoose = require('mongoose');

//MongoDB connection string.
const dbURI = 'mongodb+srv://silasrevere2_db_user:MRdmY9Vwc69Yd7N@kinnectcluster.9wfb3yl.mongodb.net/?retryWrites=true&w=majority&appName=KinnectCluster';

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process w/ failure
  }
};

//Exporting.
module.exports = connectDB;

