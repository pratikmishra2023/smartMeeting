const generateMeetingAnalysisPrompt = () => {
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
  return prompt;
};

const getMeetingAnalysisSchema = () => {
  return {
    type: "object",
    properties: {
      minutesOfMeeting: {
        type: "object",
        properties: {
          keyPoints: {
            type: "array",
            items: { type: "string" },
          },
          decisions: {
            type: "array",
            items: { type: "string" },
          },
          discussions: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["keyPoints", "decisions", "discussions"],
      },
      actionItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            task: { type: "string" },
            assignedTo: { type: "string" },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
            deadline: {
              type: ["string", "null"],
              format: "date",
            },
          },
          required: ["task", "assignedTo", "priority"],
        },
      },
      todos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            item: { type: "string" },
            category: { type: "string" },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
          },
          required: ["item", "category", "priority"],
        },
      },
    },
    required: ["minutesOfMeeting", "actionItems", "todos"],
  };
};

module.exports = {
  generateMeetingAnalysisPrompt,
  getMeetingAnalysisSchema,
};
