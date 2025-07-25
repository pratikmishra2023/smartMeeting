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
        console.log('Created uploads directory');
    }
};

// Initialize uploads directory
createUploadsDir();

// Helper function to extract text from different file types
async function extractTextFromFile(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();

    try {
        switch (ext) {
            case '.txt':
                return await fs.readFile(filePath, 'utf8');

            case '.docx':
                const result = await mammoth.extractRawText({ path: filePath });
                return result.value;

            case '.mp3':
            case '.wav':
            case '.m4a':
            case '.mp4':
                // For audio files, use OpenAI Whisper API
                const audioFile = await fs.readFile(filePath);
                const transcription = await openai.audio.transcriptions.create({
                    file: audioFile,
                    model: 'whisper-1',
                    response_format: 'text'
                });
                return transcription;

            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        throw error;
    }
}

// POST /api/transcripts/upload - Upload and process transcript
router.post('/upload', upload.single('transcript'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, date, participants } = req.body;

        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }

        // Extract text from uploaded file
        const transcriptText = await extractTextFromFile(req.file.path, req.file.originalname);

        if (!transcriptText || transcriptText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from uploaded file' });
        }

        // Parse participants if provided
        let parsedParticipants = [];
        if (participants) {
            try {
                parsedParticipants = typeof participants === 'string'
                    ? JSON.parse(participants)
                    : participants;
            } catch (error) {
                console.warn('Could not parse participants:', error);
            }
        }

        // Create new meeting record
        const meeting = await Meeting.create({
            title,
            date: new Date(date),
            participants: parsedParticipants,
            transcript: {
                originalText: transcriptText,
                source: req.file.mimetype.startsWith('audio/') ? 'audio_conversion' : 'upload',
                fileName: req.file.originalname,
                uploadedAt: new Date()
            }
        });

        // Clean up uploaded file
        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.warn('Could not delete uploaded file:', error);
        }

        res.status(201).json({
            message: 'Transcript uploaded successfully',
            meeting: meeting.toJSON()
        });

    } catch (error) {
        console.error('Upload error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.warn('Could not delete uploaded file on error:', unlinkError);
            }
        }

        res.status(500).json({
            error: 'Failed to process transcript',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/transcripts - Get all transcripts
router.get('/', async (req, res) => {
    try {
        const meetings = await Meeting.find();
        res.json(meetings.map(meeting => meeting.toJSON()));
    } catch (error) {
        console.error('Error fetching transcripts:', error);
        res.status(500).json({ error: 'Failed to fetch transcripts' });
    }
});

// GET /api/transcripts/:id - Get specific transcript
router.get('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json(meeting.toJSON());
    } catch (error) {
        console.error('Error fetching transcript:', error);
        res.status(500).json({ error: 'Failed to fetch transcript' });
    }
});

// PUT /api/transcripts/:id - Update transcript
router.put('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        const { title, date, participants, transcript } = req.body;

        if (title) meeting.title = title;
        if (date) meeting.date = new Date(date);
        if (participants) meeting.participants = participants;
        if (transcript) {
            meeting.transcript = {
                ...meeting.transcript,
                ...transcript
            };
        }

        await meeting.save();

        res.json({
            message: 'Transcript updated successfully',
            meeting: meeting.toJSON()
        });
    } catch (error) {
        console.error('Error updating transcript:', error);
        res.status(500).json({ error: 'Failed to update transcript' });
    }
});

// DELETE /api/transcripts/:id - Delete transcript
router.delete('/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findByIdAndDelete(req.params.id);

        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        res.json({ message: 'Transcript deleted successfully' });
    } catch (error) {
        console.error('Error deleting transcript:', error);
        res.status(500).json({ error: 'Failed to delete transcript' });
    }
});

// POST /api/transcripts/audio-to-text - Convert audio to text using Whisper
router.post('/audio-to-text', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        const allowedAudioTypes = ['.mp3', '.wav', '.m4a', '.mp4'];

        if (!allowedAudioTypes.includes(ext)) {
            return res.status(400).json({ error: 'Invalid audio file type' });
        }

        // Use OpenAI Whisper to transcribe audio
        const audioBuffer = await fs.readFile(req.file.path);

        const transcription = await openai.audio.transcriptions.create({
            file: audioBuffer,
            model: 'whisper-1',
            response_format: 'text'
        });

        // Clean up uploaded file
        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.warn('Could not delete uploaded audio file:', error);
        }

        res.json({
            message: 'Audio transcribed successfully',
            transcription: transcription
        });

    } catch (error) {
        console.error('Audio transcription error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.warn('Could not delete uploaded audio file on error:', unlinkError);
            }
        }

        res.status(500).json({
            error: 'Failed to transcribe audio',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
