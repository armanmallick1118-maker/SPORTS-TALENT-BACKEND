const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { db } = require('../config/firebase'); // Keep your existing Firebase import, Sensei

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
      return res.status(400).json({ error: 'No video uploaded to analyze, Sensei!' });
    }

    // 2. Safely find the physical file on your hard drive, Sensei
    const filename = assessmentData.mediaUrl.split('/').pop();
    
    // 3. Automatically choose 'python' for Windows, and 'python3' for Render/Linux, Sensei!
    const pythonCommand = os.platform() === 'win32' ? 'python' : 'python3';

    // 4. Use path.join to build safe paths that work on both Windows and Linux, Sensei!
    // IMPORTANT: If your python file has a different name, change 'main.py' to match it, Sensei!
    const scriptPath = path.join(__dirname, '..', 'ai', 'main.py'); 
    const videoPath = path.join(__dirname, '..', 'uploads', filename);

    console.log(`Starting AI Analysis with command: ${pythonCommand}, Sensei!`);
    console.log(`Target Video: ${videoPath}, Sensei!`);

    // 5. Launch the AI engine, Sensei!
    const python = spawn(pythonCommand, [scriptPath, videoPath]);

    let aiResult = '';

    // 6. Force any hidden Python errors to print to the Render logs, Sensei!
    python.stderr.on('data', (data) => {
      console.error(`PYTHON SYSTEM ERROR, SENSEI: ${data.toString()}`);
    });

    // 7. Capture the success output from Python, Sensei!
    python.stdout.on('data', (data) => {
      aiResult += data.toString();
      console.log(`PYTHON PROGRESS, SENSEI: ${data.toString()}`);
    });

    // 8. Handle the script finishing, Sensei!
    python.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Python AI script crashed, Sensei! Check Render logs." });
      }
      
      // 9. If successful, update the Firestore database with the new data, Sensei!
      await db.collection('assessments').doc(assessmentId).update({
        status: 'completed',
        aiMetrics: aiResult,
        completedAt: new Date().toISOString()
      });

      return res.status(200).json({ 
        message: "AI Analysis Complete, Sensei!",
        result: aiResult
      });
    });

  } catch (error) {
    console.error("Analysis Error, Sensei:", error);
    return res.status(500).json({ error: 'Failed to analyze: ' + error.message });
  }
module.exports = { startAssessment, uploadAssessment, analyzeAssessment };
};