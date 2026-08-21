const express = require('express');
const app = express();

// Middleware to parse incoming JSON data from Flutter, Sensei!
app.use(express.json());

// Serve static files for the frontend, Sensei!
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes, Sensei!
const authRoutes = require('./routes/auth');
const athleteRoutes = require('./routes/athlete');
const assessmentRoutes = require('./routes/assessmentRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/athletes', athleteRoutes);
app.use('/api/v1/assessments', assessmentRoutes);

// Test route for Pritha to hit, Sensei!
app.get('/api/ping', (req, res) => {
  console.log("🟢 PING RECEIVED FROM PRITHA'S FLUTTER APP, SENSEI!");
  res.status(200).json({ 
    success: true, 
    message: "Backend is locked, loaded, and talking to Flutter, Sensei!" 
  });
});

// Start the server on port 8000, Sensei!
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is locked, loaded, and permanently awake on port ${PORT}, Sensei!`);
});