#!/bin/bash

echo "🧪 Testing Smart Meeting Assistant API"
echo "====================================="

BASE_URL="http://localhost:8000"

# Check if server is running
echo "1. Checking server health..."
curl -s "$BASE_URL/health" | head -n 5
echo ""

# Test file upload
echo "2. Testing transcript upload..."
curl -X POST "$BASE_URL/api/transcripts/upload" \
  -F "transcript=@sample-data/sample-meeting-transcript.txt" \
  -F "title=Weekly Team Standup" \
  -F "date=2025-01-15" \
  -F "participants=[{\"name\":\"Sarah\",\"email\":\"sarah@company.com\",\"role\":\"PM\"},{\"name\":\"John\",\"email\":\"john@company.com\",\"role\":\"Dev\"}]"

echo ""
echo ""

# Get meetings list
echo "3. Getting meetings list..."
curl -s "$BASE_URL/api/transcripts" | head -n 10

echo ""
echo ""
echo "🎯 Next steps:"
echo "- Copy a meetingId from the response above"
echo "- Test NLP processing: curl -X POST $BASE_URL/api/nlp/process-all/MEETING_ID"
echo "- Test report generation: curl -X POST $BASE_URL/api/reports/generate/MEETING_ID -H \"Content-Type: application/json\" -d '{\"format\":\"pdf\"}'"
