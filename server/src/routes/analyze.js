const express = require("express");
const multer = require("multer");
const { analyzeWithNlpService } = require("../services/nlpClient");
const { extractResumeText } = require("../services/resumeParser");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    let resumeText = "";
    const jobDescription = (req.body.jobDescription || "").trim();

    if (req.file) {
      resumeText = await extractResumeText(req.file);
    } else {
      resumeText = (req.body.resumeText || "").trim();
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: "Resume text or file is required",
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: "jobDescription is required",
      });
    }

    const result = await analyzeWithNlpService(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Analyze route error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Analysis failed",
      details: error.message,
    });
  }
});

module.exports = router;