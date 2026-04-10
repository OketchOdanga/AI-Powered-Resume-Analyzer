const axios = require("axios");

const NLP_SERVICE_URL =
  process.env.NLP_SERVICE_URL || "http://127.0.0.1:5001/analyze";

async function analyzeWithNlpService(resumeText, jobDescription) {
  try {
    const response = await axios.post(NLP_SERVICE_URL, {
      resume_text: resumeText,
      job_description: jobDescription,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `NLP service error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    }

    if (error.request) {
      throw new Error(
        "Could not reach NLP service. Make sure the Python service is running on port 5001."
      );
    }

    throw new Error(`Axios request failed: ${error.message}`);
  }
}

module.exports = {
  analyzeWithNlpService,
};