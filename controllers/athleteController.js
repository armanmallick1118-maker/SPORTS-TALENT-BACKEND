// controllers/athleteController.js, Sensei
const { db } = require('../config/firebase');

const getAthleteProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const doc = await db.collection('athletes').doc(userId).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Athlete profile not found, Sensei' });
    }
    
    res.status(200).json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAthleteProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, age, height, weight, location, sport, position } = req.body;
    
    await db.collection('athletes').doc(userId).set({
      name,
      age,
      height,
      weight,
      location,
      sport,
      position,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    res.status(200).json({ message: 'Athlete profile updated successfully, Sensei' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAthleteProfile, updateAthleteProfile };