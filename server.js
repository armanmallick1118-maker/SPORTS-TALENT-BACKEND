const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Basic Middleware
app.use(cors());
app.use(express.json());

// 2. The Video Vault, Sensei!
// This exposes your local 'uploads' folder so Pritha's frontend can view the videos via a URL
app.use('/uploads', express.static('uploads'));

// 3. API Routes
// Make sure this points exactly to your assessmentRoutes file!
app.use('/api/assessment', require('./routes/assessmentRoutes'));

// (If you created auth or athlete routes earlier, uncomment them below, Sensei)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/athletes', require('./routes/athleteRoutes'));

// 4. Root Health Check
app.get('/', (req, res) => {
  res.send('Sports Talent API is running natively and securely, Sensei!');
});

// 5. Start the Engine
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is locked, loaded, and permanently awake on port ${PORT}, Sensei!`);
});