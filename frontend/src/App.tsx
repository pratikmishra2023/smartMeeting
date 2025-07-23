import React, { useState, useCallback } from 'react';
import './App.css';

// Types
interface Meeting {
  _id: string;
  title: string;
  date: string;
  participants: Array<{ name: string; email: string; role: string }>;
  transcript: {
    originalText: string;
    source: string;
    fileName: string;
  };
  processedData?: {
    minutesOfMeeting: {
      keyPoints: string[];
      decisions: string[];
      discussions: string[];
    };
    actionItems: Array<{
      task: string;
      assignedTo: string;
      priority: string;
      deadline?: string;
    }>;
    todos: Array<{
      item: string;
      category: string;
      priority: string;
    }>;
  };
}

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'meetings' | 'details'>('upload');

  // Upload transcript file
  const handleFileUpload = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/transcripts/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      alert(`Meeting uploaded successfully! ID: ${result.meetingId}`);
      
      // Refresh meetings list
      await fetchMeetings();
      setActiveTab('meetings');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Upload audio file
  const handleAudioUpload = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/transcripts/audio-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Audio conversion failed');
      }

      const result = await response.json();
      alert(`Audio converted successfully! ID: ${result.meetingId}`);
      
      // Refresh meetings list
      await fetchMeetings();
      setActiveTab('meetings');
      
    } catch (error) {
      console.error('Audio conversion error:', error);
      alert('Audio conversion failed. Please check your OpenAI API key.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Fetch meetings
  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch('/api/transcripts');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      
      const result = await response.json();
      setMeetings(result.meetings || []);
    } catch (error) {
      console.error('Fetch meetings error:', error);
    }
  }, []);

  // Process meeting with NLP
  const processMeeting = useCallback(async (meetingId: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/nlp/process-all/${meetingId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const result = await response.json();
      alert('Meeting processed successfully with AI!');
      
      // Update the selected meeting with processed data
      if (selectedMeeting && selectedMeeting._id === meetingId) {
        setSelectedMeeting({ ...selectedMeeting, processedData: result.processedData });
      }
      
      // Refresh meetings list
      await fetchMeetings();
      
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please check your OpenAI API key.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedMeeting]);

  // Generate report
  const generateReport = useCallback(async (meetingId: string, format: 'pdf' | 'docx') => {
    try {
      const response = await fetch(`/api/reports/generate/${meetingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      const result = await response.json();
      
      // Download the report
      const downloadLink = document.createElement('a');
      downloadLink.href = result.downloadUrl;
      downloadLink.download = result.fileName;
      downloadLink.click();
      
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Report generation failed.');
    }
  }, []);

  // Load meetings on component mount
  React.useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 Smart Meeting Assistant</h1>
        <p>AI-powered meeting insights and automation</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload
        </button>
        <button 
          className={activeTab === 'meetings' ? 'active' : ''}
          onClick={() => setActiveTab('meetings')}
        >
          📋 Meetings ({meetings.length})
        </button>
        {selectedMeeting && (
          <button 
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            📊 Details
          </button>
        )}
      </nav>

      <main className="main-content">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <div className="upload-card">
              <h2>📄 Upload Transcript</h2>
              <form onSubmit={handleFileUpload}>
                <input type="text" name="title" placeholder="Meeting Title" required />
                <input type="date" name="date" required />
                <input type="file" name="transcript" accept=".txt,.docx" required />
                <button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload Transcript'}
                </button>
              </form>
            </div>

            <div className="upload-card">
              <h2>🎙️ Convert Audio to Text</h2>
              <form onSubmit={handleAudioUpload}>
                <input type="text" name="title" placeholder="Meeting Title" required />
                <input type="date" name="date" required />
                <input type="file" name="audio" accept=".mp3,.wav,.m4a,.mp4" required />
                <button type="submit" disabled={isUploading}>
                  {isUploading ? 'Converting...' : 'Convert Audio'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="meetings-section">
            <h2>📋 Meeting History</h2>
            {meetings.length === 0 ? (
              <p>No meetings uploaded yet. Start by uploading a transcript or audio file!</p>
            ) : (
              <div className="meetings-grid">
                {meetings.map((meeting) => (
                  <div key={meeting._id} className="meeting-card">
                    <h3>{meeting.title}</h3>
                    <p>📅 {new Date(meeting.date).toLocaleDateString()}</p>
                    <p>👥 {meeting.participants.length} participants</p>
                    <p>📁 {meeting.transcript.fileName}</p>
                    
                    <div className="meeting-actions">
                      <button 
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setActiveTab('details');
                        }}
                      >
                        View Details
                      </button>
                      
                      {!meeting.processedData && (
                        <button 
                          onClick={() => processMeeting(meeting._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : '🤖 Process with AI'}
                        </button>
                      )}
                      
                      {meeting.processedData && (
                        <>
                          <button onClick={() => generateReport(meeting._id, 'pdf')}>
                            📄 PDF Report
                          </button>
                          <button onClick={() => generateReport(meeting._id, 'docx')}>
                            📝 Word Report
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && selectedMeeting && (
          <div className="details-section">
            <h2>📊 Meeting Details: {selectedMeeting.title}</h2>
            
            <div className="details-grid">
              <div className="detail-card">
                <h3>📋 Meeting Info</h3>
                <p><strong>Date:</strong> {new Date(selectedMeeting.date).toLocaleDateString()}</p>
                <p><strong>Participants:</strong></p>
                <ul>
                  {selectedMeeting.participants.map((p, i) => (
                    <li key={i}>{p.name} ({p.email})</li>
                  ))}
                </ul>
              </div>

              {selectedMeeting.processedData ? (
                <>
                  <div className="detail-card">
                    <h3>🎯 Key Points</h3>
                    <ul>
                      {selectedMeeting.processedData.minutesOfMeeting.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-card">
                    <h3>✅ Decisions Made</h3>
                    <ul>
                      {selectedMeeting.processedData.minutesOfMeeting.decisions.map((decision, i) => (
                        <li key={i}>{decision}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-card">
                    <h3>📋 Action Items</h3>
                    {selectedMeeting.processedData.actionItems.map((item, i) => (
                      <div key={i} className="action-item">
                        <p><strong>{item.task}</strong></p>
                        <p>Assigned to: {item.assignedTo}</p>
                        <p>Priority: <span className={`priority-${item.priority}`}>{item.priority}</span></p>
                        {item.deadline && <p>Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="detail-card">
                    <h3>📝 To-Do Items</h3>
                    {selectedMeeting.processedData.todos.map((todo, i) => (
                      <div key={i} className="todo-item">
                        <p><strong>{todo.item}</strong></p>
                        <p>Category: {todo.category}</p>
                        <p>Priority: <span className={`priority-${todo.priority}`}>{todo.priority}</span></p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="detail-card">
                  <h3>🤖 AI Processing</h3>
                  <p>This meeting hasn't been processed yet.</p>
                  <button 
                    onClick={() => processMeeting(selectedMeeting._id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Process with AI'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
