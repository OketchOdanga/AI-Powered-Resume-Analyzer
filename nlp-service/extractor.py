import re
import spacy

nlp = spacy.load("en_core_web_sm")

COMMON_SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "vue",
    "node",
    "node.js",
    "express",
    "mongodb",
    "mysql",
    "postgresql",
    "sql",
    "html",
    "css",
    "bootstrap",
    "tailwind",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "flask",
    "django",
    "fastapi",
    "machine learning",
    "deep learning",
    "nlp",
    "natural language processing",
    "data analysis",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "rest api",
    "api",
    "linux",
    "figma",
    "firebase"
}

SECTION_HINTS = [
    "summary",
    "objective",
    "skills",
    "technical skills",
    "experience",
    "work experience",
    "education",
    "projects",
    "certifications",
    "achievements"
]

def normalize_text(text: str) -> str:
    """
    Lowercase and collapse multiple spaces.
    """
    return re.sub(r"\s+", " ", text.lower()).strip()

def extract_keywords(text: str):
    """
    Extract keywords using spaCy.
    We keep useful nouns, proper nouns, adjectives, and some verbs.
    """
    doc = nlp(text)
    keywords = []

    for token in doc:
        if token.is_stop or token.is_punct or token.is_space:
            continue

        if len(token.text.strip()) < 3:
            continue

        if token.pos_ in {"NOUN", "PROPN", "ADJ", "VERB"}:
            lemma = token.lemma_.lower().strip()
            if lemma:
                keywords.append(lemma)

    # Remove duplicates while keeping order
    seen = set()
    unique_keywords = []
    for kw in keywords:
        if kw not in seen:
            seen.add(kw)
            unique_keywords.append(kw)

    return unique_keywords

def extract_skills(text: str):
    """
    Extract skills by checking whether known skill terms appear in text.
    """
    lower_text = normalize_text(text)
    found_skills = set()

    for skill in COMMON_SKILLS:
        if skill in lower_text:
            found_skills.add(skill)

    return sorted(found_skills)

def estimate_years_of_experience(text: str):
    """
    Estimate years of experience from phrases like:
    - 2 years
    - 3+ years
    - 5 years of experience
    """
    lower_text = text.lower()

    patterns = [
        r"(\d+)\+?\s+years?",
        r"(\d+)\+?\s+yrs?",
        r"(\d+)\+?\s+years? of experience",
        r"experience of (\d+)\+?\s+years?"
    ]

    years_found = []

    for pattern in patterns:
        matches = re.findall(pattern, lower_text)
        for match in matches:
            try:
                years_found.append(int(match))
            except ValueError:
                pass

    return max(years_found) if years_found else 0

def detect_sections(text: str):
    """
    Check which common resume sections are present.
    """
    lower_text = text.lower()
    found_sections = []

    for section in SECTION_HINTS:
        if section in lower_text:
            found_sections.append(section)

    return found_sections

def score_keyword_match(resume_keywords, jd_keywords):
    """
    Compute percentage of JD keywords found in resume keywords.
    """
    jd_set = set(jd_keywords)
    resume_set = set(resume_keywords)

    if not jd_set:
        return 0, [], []

    matched = sorted(jd_set.intersection(resume_set))
    missing = sorted(jd_set.difference(resume_set))

    score = int((len(matched) / len(jd_set)) * 100)
    return score, matched, missing

def score_skill_match(resume_skills, jd_skills):
    """
    Compute percentage of JD skills found in resume skills.
    """
    jd_set = set(jd_skills)
    resume_set = set(resume_skills)

    if not jd_set:
        return 0, [], []

    matched = sorted(jd_set.intersection(resume_set))
    missing = sorted(jd_set.difference(resume_set))

    score = int((len(matched) / len(jd_set)) * 100)
    return score, matched, missing

def score_experience(resume_years):
    """
    Convert years into a score out of 100.
    """
    if resume_years <= 0:
        return 0
    if resume_years == 1:
        return 40
    if resume_years == 2:
        return 60
    if resume_years == 3:
        return 75
    if resume_years == 4:
        return 85
    return 100

def score_completeness(found_sections):
    """
    Score based on presence of important resume sections.
    """
    important_sections = {"skills", "experience", "education", "projects"}
    found = set(found_sections)

    count = 0
    for section in important_sections:
        if section in found:
            count += 1

    return int((count / len(important_sections)) * 100)

def generate_feedback(
    matched_skills,
    missing_skills,
    missing_keywords,
    found_sections,
    years_of_experience,
    final_score
):
    feedback = []

    if final_score >= 80:
        feedback.append("This resume is a strong match for the job description.")
    elif final_score >= 60:
        feedback.append("This resume is a moderate match but can be improved.")
    else:
        feedback.append("This resume needs more alignment with the job description.")

    if matched_skills:
        feedback.append(
            "Strong skills found: " + ", ".join(matched_skills[:8]) + "."
        )

    if missing_skills:
        feedback.append(
            "Missing or weak skill coverage: " + ", ".join(missing_skills[:8]) + "."
        )

    if missing_keywords:
        feedback.append(
            "Add more job-specific keywords such as: " +
            ", ".join(missing_keywords[:8]) + "."
        )

    if years_of_experience == 0:
        feedback.append("Your resume does not clearly show years of experience.")

    if "projects" not in found_sections:
        feedback.append("Add a Projects section to highlight practical work.")

    if "skills" not in found_sections:
        feedback.append("Add a dedicated Skills section for better ATS matching.")

    if "experience" not in found_sections and "work experience" not in found_sections:
        feedback.append("Add a Work Experience section to show role relevance.")

    if "education" not in found_sections:
        feedback.append("Add an Education section if applicable.")

    feedback.append("Use measurable achievements like 'improved speed by 30%' instead of generic task descriptions.")

    return feedback

def analyze_resume_against_jd(resume_text: str, job_description: str):
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(job_description)

    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    years_of_experience = estimate_years_of_experience(resume_text)
    found_sections = detect_sections(resume_text)

    keyword_score, matched_keywords, missing_keywords = score_keyword_match(
        resume_keywords, jd_keywords
    )

    skill_score, matched_skills, missing_skills = score_skill_match(
        resume_skills, jd_skills
    )

    experience_score = score_experience(years_of_experience)
    completeness_score = score_completeness(found_sections)

    final_score = int(
        (keyword_score * 0.50) +
        (skill_score * 0.25) +
        (experience_score * 0.15) +
        (completeness_score * 0.10)
    )

    feedback = generate_feedback(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        missing_keywords=missing_keywords,
        found_sections=found_sections,
        years_of_experience=years_of_experience,
        final_score=final_score
    )

    return {
        "final_score": final_score,
        "keyword_score": keyword_score,
        "skill_score": skill_score,
        "experience_score": experience_score,
        "completeness_score": completeness_score,
        "matched_keywords": matched_keywords[:20],
        "missing_keywords": missing_keywords[:20],
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "sections_found": found_sections,
        "estimated_years_experience": years_of_experience,
        "feedback": feedback
    }