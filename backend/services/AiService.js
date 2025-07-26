const axios = require("axios");
const {
  generateMeetingAnalysisPrompt,
  getMeetingAnalysisSchema,
} = require("../utils/promptUtils");

class AiService {
  constructor(transcript) {
    this.transcript = transcript;
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.baseURL = "https://api.perplexity.ai/chat/completions";
  }

  generateMeetingAnalysis() {
    const prompt = generateMeetingAnalysisPrompt();
    const schema = getMeetingAnalysisSchema();

    return axios.post(
      this.baseURL,
      {
        model: "sonar",
        messages: [
          { role: "system", content: "Be precise and concise." },
          {
            role: "user",
            content: `${prompt}\n\nMeeting Transcript:\n${this.transcript}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { schema: schema },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async processMeetingData() {
    try {
      const response = await this.generateMeetingAnalysis();
      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `AI Service Error: ${error.response?.data || error.message}`
      );
    }
  }
}

module.exports = AiService;
