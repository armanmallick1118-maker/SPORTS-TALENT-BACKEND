// server.js, Sensei
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebase');
const verifyToken = require('./middleware/auth');
const athleteRoutes = require('./routes/athlete');

const app = express();
app.use(cors());
app.use(express.json());

// Basic Health Check Route, Sensei
app.get('/', (req, res) => {
  res.send('AI Sports Talent Backend is running perfectly, Sensei!');
});

// Register or Update Profile Route, Sensei
app.post('/auth/profile', verifyToken, async (req, res) => {
  try {
    const { name, role, sport } = req.body; 
    const userId = req.user.uid;

    await db.collection('users').doc(userId).set({
      name,
      email: req.user.email,
      role, 
      sport,
      createdAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({ message: 'Profile saved successfully to Firestore, Sensei!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Athlete API Routes, Sensei
app.use('/api/athletes', athleteRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is locked, loaded, and permanently awake on port ${PORT}, Sensei!`);
});

server.on('error', (error) => {
  console.error('An error tried to close the server, Sensei:', error);
});