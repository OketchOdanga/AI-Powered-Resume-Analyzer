from flask import Flask, request, jsonify
from extractor import analyze_resume_against_jd

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Resume NLP Service is running"
    })

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        resume_text = data.get("resume_text", "").strip()
        job_description = data.get("job_description", "").strip()

        if not resume_text:
            return jsonify({"error": "resume_text is required"}), 400

        if not job_description:
            return jsonify({"error": "job_description is required"}), 400

        result = analyze_resume_against_jd(resume_text, job_description)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            "error": "Analysis failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)