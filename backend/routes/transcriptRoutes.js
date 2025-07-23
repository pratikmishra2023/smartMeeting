const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');
const Meeting = require('../models/Meeting');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.docx', '.mp3', '.wav', '.m4a', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .docx, .mp3, .wav, .m4a, .mp4 files are allowed.'));
    }
  }
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  const uploadDir = path.join(__dirname, '../uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};
createUploadsDir();

// POST /api/transcripts/upload - Upload text transcript
router.post('/upload', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, date, participants } = req.body;
    let transcriptText = '';

    // Process different file types
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.txt') {
      transcriptText = await fs.readFile(req.file.path, 'utf8');
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: req.file.path });
      transcriptText = result.value;
    }

    // Create meeting record
    const meeting = new Meeting({
      title: title || 'Untitled Meeting',
      date: new Date(date) || new Date(),
      participants: participants ? JSON.parse(participants) : [],
      transcript: {
        originalText: transcriptText,
        source: 'upload',
        fileName: req.file.originalname,
        uploadedAt: new Date()
      }
    });

    await meeting.save();

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.status(201).json({
      success: true,
      meetingId: meeting._id,
      message: 'Transcript uploaded successfully',
      transcript: {
        length: transcriptText.length,
        preview: transcriptText.substring(0, 200) + '...'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to process transcript',
      details: error.message
    });
  }
});

// POST /api/transcripts/audio-to-text - Convert audio to text
router.post('/audio-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const { title, date, participants } = req.body;

    // Convert audio to text using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'en'
    });

    const transcriptText = transcription.text;

    // Create meeting record
    const meeting = new Meeting({
      title: title || 'Untitled Meeting',
      date: new Date(date) || new Date(),
      participants: participants ? JSON.parse(participants) : [],
      transcript: {
        originalText: transcriptText,
        source: 'audio_conversion',
        fileName: req.file.originalname,
        uploadedAt: new Date()
      }
    });

    await meeting.save();

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.status(201).json({
      success: true,
      meetingId: meeting._id,
      message: 'Audio converted to text successfully',
      transcript: {
        length: transcriptText.length,
        preview: transcriptText.substring(0, 200) + '...',
        fullText: transcriptText
      }
    });

  } catch (error) {
    console.error('Audio conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert audio to text',
      details: error.message
    });
  }
});

// GET /api/transcripts/:id - Get specific meeting transcript
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      success: true,
      meeting: {
        id: meeting._id,
        title: meeting.title,
        date: meeting.date,
        participants: meeting.participants,
        transcript: meeting.transcript,
        processedData: meeting.processedData
      }
    });

  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transcript',
      details: error.message
    });
  }
});

// GET /api/transcripts - Get all meetings
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const meetings = await Meeting.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title date participants transcript.fileName createdAt processedData');

    const total = await Meeting.countDocuments();

    res.json({
      success: true,
      meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve meetings',
      details: error.message
    });
  }
});

module.exports = router;
