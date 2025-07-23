const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  participants: [{
    name: String,
    email: String,
    role: String
  }],
  transcript: {
    originalText: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['upload', 'audio_conversion'],
      required: true
    },
    fileName: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  processedData: {
    minutesOfMeeting: {
      keyPoints: [String],
      decisions: [String],
      discussions: [String]
    },
    actionItems: [{
      task: String,
      assignedTo: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      deadline: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],
    todos: [{
      item: String,
      category: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },
  reports: {
    summaryGenerated: {
      type: Boolean,
      default: false
    },
    reportPath: String,
    generatedAt: Date
  },
  calendarEvents: [{
    eventId: String,
    title: String,
    date: Date,
    attendees: [String],
    icsGenerated: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
meetingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
meetingSchema.index({ date: -1 });
meetingSchema.index({ 'participants.email': 1 });
meetingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Meeting', meetingSchema);
