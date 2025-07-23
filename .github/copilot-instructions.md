<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Smart Meeting Assistant - Copilot Instructions

This is a Smart Meeting Assistant project built with Node.js/Express backend and React frontend. The application processes meeting transcripts using AI to extract actionable insights.

## Project Structure
- `backend/` - Node.js Express API with MongoDB
- `frontend/` - React TypeScript application  
- `nlp/` - NLP processing utilities
- `audio_processing/` - Audio conversion tools
- `calendar_integration/` - Calendar utilities
- `reports/` - Report generation

## Key Technologies
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI/NLP**: OpenAI GPT-4, Whisper API for speech-to-text
- **Frontend**: React 18, TypeScript, Axios
- **File Processing**: Multer for uploads, mammoth for .docx, jsPDF for reports
- **Calendar**: node-ical for .ics generation

## API Design Patterns
- RESTful endpoints with proper HTTP methods
- Async/await pattern throughout
- Error handling with try-catch blocks
- File upload handling with Multer
- MongoDB operations with Mongoose models

## Code Style Preferences
- Use async/await instead of promises
- Consistent error handling with descriptive messages
- TypeScript for frontend components
- Modular route structure in backend
- Environment variables for configuration

## Database Schema
The main `Meeting` model includes transcript data, processed NLP results, calendar events, and report generation status. Always maintain data consistency when updating related fields.

## NLP Processing
All NLP operations use OpenAI GPT-4 with structured prompts to extract:
- Minutes of Meeting (MOMs): key points, decisions, discussions
- Action Items: tasks with assignments, priorities, deadlines
- To-dos: general items with categories and priorities

## File Handling
- Support .txt, .docx for transcript uploads
- Support .mp3, .wav, .m4a, .mp4 for audio conversion
- Generate .ics files for calendar integration
- Create PDF/DOCX reports for meeting summaries

When suggesting code improvements or new features, consider the existing patterns and maintain consistency with the established architecture.
