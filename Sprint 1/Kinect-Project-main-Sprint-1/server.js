const express = require('express');
const connectDB = require('./db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/appointments', require('./routes/appointments'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));