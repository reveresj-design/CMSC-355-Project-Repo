const mongoose = require('mongoose');

//MONGODB CONNECTION STRING
const dbURI = 'mongodb+srv://silasrevere2_db_user:MRdmY9Vwc69Yd7N@kinnectcluster.9wfb3yl.mongodb.net/?retryWrites=true&w=majority&appName=KinnectCluster';

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;