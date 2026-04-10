import { useState } from "react";
import "./App.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);

  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    if (!file && !resumeText.trim()) {
      setError("Please paste your resume text or upload a resume file.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      if (file) {
        formData.append("resume", file);
      } else {
        formData.append("resumeText", resumeText);
      }

      formData.append("jobDescription", jobDescription);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setFile(null);
    setResumeText(`John Doe

Skills:
Python, React, SQL, Git, Flask

Experience:
3 years of software development experience.
Built internal dashboards and APIs for business operations.

Projects:
Built a dashboard using React and Flask.
Created a REST API for employee management.

Education:
BSc Computer Science`);

    setJobDescription(`We are hiring a software developer with Python, React, SQL, API development, and Git experience.
Minimum 2 years experience required.
Candidates with web application development experience are preferred.`);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>AI-Powered Resume Analyzer</h1>
        <p className="subtitle">
          Paste a resume or upload a PDF/DOCX file, then add a job description
          to analyze match score, strengths, gaps, and improvement suggestions.
        </p>

        <div className="top-actions">
          <button className="sample-btn" onClick={handleLoadSample}>
            Load Sample Data
          </button>
        </div>

        <div className="form-section">
          <div className="input-card">
            <label>Upload Resume (PDF or DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                setFile(selectedFile || null);
                if (selectedFile) {
                  setResumeText(""); // optional: clear text if file is used
                  }
                }}
                />
            {file && <p>Selected file: {file.name}</p>}
          </div>

          <div className="input-card">
            <label>Resume Text</label>
            <textarea
              rows="14"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={file !== null}
              placeholder="Paste resume text here if you are not uploading a file..."
            />
          </div>

          <div className="input-card">
            <label>Job Description</label>
            <textarea
              rows="14"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here..."
            />
          </div>
        </div>

        <div className="analyze-row">
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <div className="results">
            <div className="score-card main-score">
              <h2>Final Score</h2>
              <div className="score-circle">{result.final_score}</div>
            </div>

            <div className="score-grid">
              <div className="score-card">
                <h3>Keyword Score</h3>
                <p>{result.keyword_score}/100</p>
              </div>

              <div className="score-card">
                <h3>Skill Score</h3>
                <p>{result.skill_score}/100</p>
              </div>

              <div className="score-card">
                <h3>Experience Score</h3>
                <p>{result.experience_score}/100</p>
              </div>

              <div className="score-card">
                <h3>Completeness Score</h3>
                <p>{result.completeness_score}/100</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="result-card">
                <h3>Matched Skills</h3>
                <div className="chip-wrap">
                  {result.matched_skills.length > 0 ? (
                    result.matched_skills.map((skill, index) => (
                      <span className="chip good" key={index}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No matched skills found.</p>
                  )}
                </div>
              </div>

              <div className="result-card">
                <h3>Missing Skills</h3>
                <div className="chip-wrap">
                  {result.missing_skills.length > 0 ? (
                    result.missing_skills.map((skill, index) => (
                      <span className="chip bad" key={index}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p>No missing skills found.</p>
                  )}
                </div>
              </div>

              <div className="result-card">
                <h3>Matched Keywords</h3>
                <div className="chip-wrap">
                  {result.matched_keywords.length > 0 ? (
                    result.matched_keywords.map((keyword, index) => (
                      <span className="chip neutral" key={index}>
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p>No matched keywords found.</p>
                  )}
                </div>
              </div>

              <div className="result-card">
                <h3>Missing Keywords</h3>
                <div className="chip-wrap">
                  {result.missing_keywords.length > 0 ? (
                    result.missing_keywords.map((keyword, index) => (
                      <span className="chip warning" key={index}>
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p>No missing keywords found.</p>
                  )}
                </div>
              </div>

              <div className="result-card full-width">
                <h3>Sections Found</h3>
                <div className="chip-wrap">
                  {result.sections_found.length > 0 ? (
                    result.sections_found.map((section, index) => (
                      <span className="chip neutral" key={index}>
                        {section}
                      </span>
                    ))
                  ) : (
                    <p>No resume sections detected.</p>
                  )}
                </div>
              </div>

              <div className="result-card full-width">
                <h3>Estimated Years of Experience</h3>
                <p className="experience-number">
                  {result.estimated_years_experience} year(s)
                </p>
              </div>

              <div className="result-card full-width">
                <h3>Feedback & Suggestions</h3>
                <ul className="feedback-list">
                  {result.feedback.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;