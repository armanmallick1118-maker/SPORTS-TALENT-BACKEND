const { db } = require('../config/firebase');
const { spawn } = require('child_process');
const path = require('path');

// @desc    Start a new assessment
const startAssessment = async (req, res) => {
  try {
    const { sport, testType } = req.body;
    const athleteId = req.user ? req.user.uid : "test-athlete-123";

    const assessmentData = {
      athleteId: athleteId,
      sport: sport,
      testType: testType,
      status: 'STARTED',
      startedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('assessments').add(assessmentData);

    res.status(201).json({
      message: 'Assessment started successfully, Sensei!',
      assessmentId: docRef.id,
      ...assessmentData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start assessment' });
  }
};

// @desc    Upload assessment media
const uploadAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    if (!assessmentId) {
      return res.status(400).json({ error: 'Missing assessmentId in the body, Sensei!' });
    }

    if (!req.file) {
       return res.status(400).json({ error: 'No video file received, Sensei!' });
    }

    const mediaUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    await db.collection('assessments').doc(assessmentId).update({
      status: 'UPLOADED',
      mediaUrl: mediaUrl,
      uploadedAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: 'Media uploaded successfully, Sensei!',
      mediaUrl: mediaUrl
    });
  } catch (error) {
    console.error("Upload Error, Sensei:", error);
    res.status(500).json({ error: 'Failed to upload: ' + error.message });
  }
};

// @desc    Analyze the assessment using Python AI
// @route   POST /api/assessment/analyze
const analyzeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.body;

    // 1. Fetch the document to find the video URL, Sensei
    const doc = await db.collection('assessments').doc(assessmentId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assessment not found, Sensei!' });
    }

    const assessmentData = doc.data();
    if (!assessmentData.mediaUrl) {
      return res.status(400).json({ error: 'No video uploaded to analyze yet, Sensei!' });
    }

    // 2. Find the physical file on your hard drive, Sensei
    const filename = assessmentData.mediaUrl.split('/').pop();
    const localVideoPath = path.join(__dirname, '..', 'uploads', filename);

    // 3. Spawn the Python process and pass the video path, Sensei!
    const pythonProcess = spawn('python', ['ai/analyzer.py', localVideoPath]);

    let aiOutput = '';

    // 4. Listen for the Python script's print() statements, Sensei
    pythonProcess.stdout.on('data', (data) => {
      aiOutput += data.toString();
    });

    // 5. When Python finishes, update Firebase, Sensei!
    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
         return res.status(500).json({ error: 'Python AI script crashed, Sensei!' });
      }

      const aiResults = JSON.parse(aiOutput);

      await db.collection('assessments').doc(assessmentId).update({
        status: 'COMPLETED',
        aiMetrics: aiResults.metrics,
        analyzedAt: new Date().toISOString(),
      });

      res.status(200).json({ 
        message: 'AI Analysis complete, Sensei!',
        metrics: aiResults.metrics
      });
    });

  } catch (error) {
    console.error("AI Bridge Error, Sensei:", error);
    res.status(500).json({ error: 'Failed to trigger analysis' });
  }
};
// @desc    Get assessment record
const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('assessments').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.status(200).json({
      assessmentId: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

// This export block is what prevents line 10 from crashing, Sensei!
module.exports = {
  startAssessment,
  uploadAssessment,
  analyzeAssessment,
  getAssessment
};