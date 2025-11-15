// FileName: server.js
// Description: Connects to DB, sets up 
// middleware, and defines API routes.

//Imports
const express = require('express');
const connectDB = require('./db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/groups', require('./routes/groups')); 


// Test for server activity
app.get('/api/ping', (req, res) => {
  res.send('Backend is alive!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));