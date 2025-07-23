const express = require('express');
const OpenAI = require('openai');
const Meeting = require('../models/Meeting');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to call OpenAI for text processing
async function processWithOpenAI(prompt, text) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting analyst. Extract information accurately and format responses as valid JSON.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nMeeting Transcript:\n${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process with AI');
  }
}

// POST /api/nlp/extract-moms/:meetingId - Extract Minutes of Meeting
router.post('/extract-moms/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const prompt = `
    Analyze this meeting transcript and extract the Minutes of Meeting (MOMs) in the following JSON format:
    {
      "keyPoints": ["point 1", "point 2", ...],
      "decisions": ["decision 1", "decision 2", ...],
      "discussions": ["discussion topic 1", "discussion topic 2", ...]
    }
    
    Extract:
    - Key Points: Main topics discussed and important information shared
    - Decisions: Concrete decisions made during the meeting
    - Discussions: Important discussion topics and outcomes
    `;

    const aiResponse = await processWithOpenAI(prompt, meeting.transcript.originalText);

    let momsData;
    try {
      momsData = JSON.parse(aiResponse);
    } catch (parseError) {
      // Fallback parsing if JSON is malformed
      momsData = {
        keyPoints: ['Failed to parse AI response - please review transcript manually'],
        decisions: [],
        discussions: []
      };
    }

    // Update meeting with extracted MOMs
    meeting.processedData.minutesOfMeeting = momsData;
    await meeting.save();

    res.json({
      success: true,
      meetingId: meeting._id,
      minutesOfMeeting: momsData,
      message: 'Minutes of Meeting extracted successfully'
    });

  } catch (error) {
    console.error('MOMs extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract Minutes of Meeting',
      details: error.message
    });
  }
});

// POST /api/nlp/extract-action-items/:meetingId - Extract Action Items
router.post('/extract-action-items/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const prompt = `
    Analyze this meeting transcript and extract action items in the following JSON format:
    {
      "actionItems": [
        {
          "task": "description of the task",
          "assignedTo": "person responsible",
          "priority": "high|medium|low",
          "deadline": "YYYY-MM-DD or null if not specified"
        }
      ]
    }
    
    Extract all tasks, assignments, and follow-up actions mentioned in the meeting.
    If no specific person is assigned, use "Unassigned".
    If no deadline is mentioned, use null.
    Determine priority based on urgency indicators in the conversation.
    `;

    const aiResponse = await processWithOpenAI(prompt, meeting.transcript.originalText);

    let actionItemsData;
    try {
      const parsed = JSON.parse(aiResponse);
      actionItemsData = parsed.actionItems || [];
    } catch (parseError) {
      actionItemsData = [];
    }

    // Update meeting with extracted action items
    meeting.processedData.actionItems = actionItemsData;
    await meeting.save();

    res.json({
      success: true,
      meetingId: meeting._id,
      actionItems: actionItemsData,
      message: 'Action items extracted successfully'
    });

  } catch (error) {
    console.error('Action items extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract action items',
      details: error.message
    });
  }
});

// POST /api/nlp/extract-todos/:meetingId - Extract To-Do Lists
router.post('/extract-todos/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const prompt = `
    Analyze this meeting transcript and extract to-do items in the following JSON format:
    {
      "todos": [
        {
          "item": "description of the to-do item",
          "category": "category like 'research', 'follow-up', 'preparation', etc.",
          "priority": "high|medium|low"
        }
      ]
    }
    
    Extract general to-do items, follow-up tasks, and things that need to be done.
    Categorize each item appropriately.
    Determine priority based on context and urgency.
    `;

    const aiResponse = await processWithOpenAI(prompt, meeting.transcript.originalText);

    let todosData;
    try {
      const parsed = JSON.parse(aiResponse);
      todosData = parsed.todos || [];
    } catch (parseError) {
      todosData = [];
    }

    // Update meeting with extracted todos
    meeting.processedData.todos = todosData;
    await meeting.save();

    res.json({
      success: true,
      meetingId: meeting._id,
      todos: todosData,
      message: 'To-do items extracted successfully'
    });

  } catch (error) {
    console.error('Todos extraction error:', error);
    res.status(500).json({
      error: 'Failed to extract to-do items',
      details: error.message
    });
  }
});

// POST /api/nlp/process-all/:meetingId - Process all NLP extractions at once
router.post('/process-all/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const prompt = `
    Analyze this meeting transcript and extract all information in the following JSON format:
    {
      "minutesOfMeeting": {
        "keyPoints": ["point 1", "point 2", ...],
        "decisions": ["decision 1", "decision 2", ...],
        "discussions": ["discussion topic 1", "discussion topic 2", ...]
      },
      "actionItems": [
        {
          "task": "description of the task",
          "assignedTo": "person responsible",
          "priority": "high|medium|low",
          "deadline": "YYYY-MM-DD or null if not specified"
        }
      ],
      "todos": [
        {
          "item": "description of the to-do item",
          "category": "category like 'research', 'follow-up', 'preparation', etc.",
          "priority": "high|medium|low"
        }
      ]
    }
    
    Extract everything comprehensively from the meeting transcript.
    `;

    const aiResponse = await processWithOpenAI(prompt, meeting.transcript.originalText);

    let processedData;
    try {
      processedData = JSON.parse(aiResponse);
    } catch (parseError) {
      throw new Error('Failed to parse AI response');
    }

    // Update meeting with all extracted data
    meeting.processedData = {
      minutesOfMeeting: processedData.minutesOfMeeting || { keyPoints: [], decisions: [], discussions: [] },
      actionItems: processedData.actionItems || [],
      todos: processedData.todos || []
    };

    await meeting.save();

    res.json({
      success: true,
      meetingId: meeting._id,
      processedData: meeting.processedData,
      message: 'All NLP processing completed successfully'
    });

  } catch (error) {
    console.error('Complete processing error:', error);
    res.status(500).json({
      error: 'Failed to process meeting data',
      details: error.message
    });
  }
});

// GET /api/nlp/processed-data/:meetingId - Get all processed data for a meeting
router.get('/processed-data/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)
      .select('title date processedData');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      success: true,
      meetingId: meeting._id,
      title: meeting.title,
      date: meeting.date,
      processedData: meeting.processedData || {
        minutesOfMeeting: { keyPoints: [], decisions: [], discussions: [] },
        actionItems: [],
        todos: []
      }
    });

  } catch (error) {
    console.error('Get processed data error:', error);
    res.status(500).json({
      error: 'Failed to retrieve processed data',
      details: error.message
    });
  }
});

module.exports = router;
