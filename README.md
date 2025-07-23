# 🤖 Smart Meeting Assistant

[![GitHub stars](https://img.shields.io/github/stars/pratikmishra2023/smartMeeting.svg?style=flat-square)](https://github.com/pratikmishra2023/smartMeeting/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pratikmishra2023/smartMeeting.svg?style=flat-square)](https://github.com/pratikmishra2023/smartMeeting/network)
[![GitHub issues](https://img.shields.io/github/issues/pratikmishra2023/smartMeeting.svg?style=flat-square)](https://github.com/pratikmishra2023/smartMeeting/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An AI-powered tool that automates post-meeting workflows by extracting actionable insights from meeting transcripts and audio recordings using **OpenAI GPT-4** and **Whisper AI**.

## Features

- **Transcript Processing**: Upload .txt/.docx files or convert audio to text using Whisper AI
- **NLP Extraction**: Extract Minutes of Meeting (MOMs), action items, and to-dos using OpenAI GPT-4
- **Calendar Integration**: Generate .ics files for follow-up meetings and action item reminders
- **Report Generation**: Create PDF/DOCX summary reports
- **Database Storage**: MongoDB for persistent storage of meetings and processed data

## Architecture

```
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   └── server.js     # Main server file
├── frontend/         # React TypeScript app
├── nlp/             # NLP processing utilities
├── audio_processing/ # Audio conversion tools
├── calendar_integration/ # Calendar utilities
└── reports/         # Report generation
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 3. Environment Configuration

Create `backend/.env` with:

```env
MONGODB_URI=mongodb://localhost:27017/meeting_assistant
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Transcript Management
- `POST /api/transcripts/upload` - Upload text transcript
- `POST /api/transcripts/audio-to-text` - Convert audio to text
- `GET /api/transcripts/:id` - Get specific meeting
- `GET /api/transcripts` - Get all meetings

### NLP Processing
- `POST /api/nlp/extract-moms/:meetingId` - Extract Minutes of Meeting
- `POST /api/nlp/extract-action-items/:meetingId` - Extract action items
- `POST /api/nlp/extract-todos/:meetingId` - Extract to-do items
- `POST /api/nlp/process-all/:meetingId` - Process all NLP extractions
- `GET /api/nlp/processed-data/:meetingId` - Get processed data

### Calendar Integration
- `POST /api/calendar/generate-ics/:meetingId` - Generate ICS file
- `POST /api/calendar/create-action-item-reminders/:meetingId` - Create reminders
- `GET /api/calendar/events/:meetingId` - Get calendar events

### Reports
- `POST /api/reports/generate/:meetingId` - Generate PDF/DOCX report
- `GET /api/reports/download/:fileName` - Download report
- `POST /api/reports/email-summary/:meetingId` - Generate email summary

## Database Schema

### Meeting Model
```javascript
{
  title: String,
  date: Date,
  participants: [{ name, email, role }],
  transcript: {
    originalText: String,
    source: 'upload' | 'audio_conversion',
    fileName: String
  },
  processedData: {
    minutesOfMeeting: { keyPoints, decisions, discussions },
    actionItems: [{ task, assignedTo, priority, deadline }],
    todos: [{ item, category, priority }]
  },
  reports: { summaryGenerated, reportPath },
  calendarEvents: [{ eventId, title, date, attendees }]
}
```

## Usage Examples

### 1. Upload and Process Meeting

```javascript
// Upload transcript
const formData = new FormData();
formData.append('transcript', file);
formData.append('title', 'Weekly Team Meeting');
formData.append('date', '2025-01-15');

const response = await fetch('/api/transcripts/upload', {
  method: 'POST',
  body: formData
});

const { meetingId } = await response.json();

// Process with NLP
await fetch(`/api/nlp/process-all/${meetingId}`, {
  method: 'POST'
});

// Generate report
await fetch(`/api/reports/generate/${meetingId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ format: 'pdf' })
});
```

### 2. Create Calendar Reminders

```javascript
await fetch(`/api/calendar/create-action-item-reminders/${meetingId}`, {
  method: 'POST'
});
```

## Dependencies

### Backend
- **Express.js**: Web framework
- **MongoDB/Mongoose**: Database
- **OpenAI**: NLP processing
- **Multer**: File upload handling
- **jsPDF/docx**: Report generation
- **node-ical**: Calendar file generation

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Axios**: HTTP client

## Development Timeline

- **Day 1**: Project setup ✅
- **Day 2**: Transcript ingestion (upload + audio-to-text) 
- **Day 3**: NLP pipeline for MOMs, tasks, to-dos ✅
- **Day 4**: Calendar invite generation ✅
- **Day 5**: Report generation ✅
- **Day 6**: Integration, testing, bug fixes
- **Day 7**: Final demo, documentation

## Team Members & Responsibilities

- **Parwez**: Planning & Demo coordination
- **Mohon**: UI Development
- **Suganya & Abhishek**: Audio Module
- **Shiba & Jitesh**: API Development  
- **Raja, Pratik, Pandi**: NLP Processing
- **TBD**: Calendar Automation
- **Manish**: Reporting & Email drafts

## Getting Started for Team Members

1. **Clone the repository**
2. **Set up your development environment**:
   - Install Node.js 18+
   - Install MongoDB locally or use cloud instance
   - Get OpenAI API key
3. **Pick your module** and focus on specific routes/components
4. **Test your changes** with the API endpoints

## Contributing

1. Work on your assigned module
2. Test API endpoints with tools like Postman
3. Follow the existing code structure
4. Update documentation as needed

## License

MIT License - See LICENSE file for details
