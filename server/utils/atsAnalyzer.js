const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'also', 'now', 'our', 'your', 'their', 'my', 'his', 'her', 'as', 'if', 'about',
]);

const extractKeywords = (text) => {
  if (!text) return [];
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    ),
  ];
};

const extractSkills = (text) => {
  const skillPatterns = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'nodejs', 'angular',
    'vue', 'mongodb', 'sql', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
    'git', 'agile', 'scrum', 'leadership', 'communication', 'problem solving', 'machine learning',
    'data analysis', 'project management', 'html', 'css', 'tailwind', 'express', 'redux',
    'graphql', 'rest', 'api', 'ci/cd', 'devops', 'figma', 'ui/ux', 'seo', 'marketing',
    'sales', 'excel', 'powerpoint', 'tableau', 'power bi', 'tensorflow', 'pytorch',
    'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r',
  ];

  const lower = text.toLowerCase();
  return skillPatterns.filter((skill) => lower.includes(skill));
};

const calculateSectionScore = (resumeText, sectionKeywords) => {
  const resumeKeywords = extractKeywords(resumeText);
  if (sectionKeywords.length === 0) return 100;
  const matched = sectionKeywords.filter((k) =>
    resumeKeywords.some((rk) => rk.includes(k) || k.includes(rk))
  );
  return Math.round((matched.length / sectionKeywords.length) * 100);
};

export const analyzeResume = (resumeText, jobDescription = '') => {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  const matchedKeywords = jobKeywords.filter((k) =>
    resumeKeywords.some((rk) => rk.includes(k) || k.includes(rk))
  );
  const missingKeywords = jobKeywords.filter(
    (k) => !resumeKeywords.some((rk) => rk.includes(k) || k.includes(rk))
  );

  const matchedSkills = jobSkills.filter((s) => resumeSkills.includes(s));
  const missingSkills = jobSkills.filter((s) => !resumeSkills.includes(s));

  const keywordScore = jobKeywords.length
    ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
    : 75;

  const skillsScore = jobSkills.length
    ? Math.round((matchedSkills.length / jobSkills.length) * 100)
    : resumeSkills.length > 5 ? 80 : 50;

  const experienceSection = resumeText.match(/experience[\s\S]*?(?=education|skills|certification|$)/i)?.[0] || resumeText;
  const educationSection = resumeText.match(/education[\s\S]*?(?=experience|skills|certification|$)/i)?.[0] || '';

  const experienceKeywords = jobKeywords.filter((k) =>
    ['years', 'senior', 'junior', 'lead', 'manager', 'developer', 'engineer', 'analyst'].some((e) => k.includes(e))
  );
  const educationKeywords = jobKeywords.filter((k) =>
    ['degree', 'bachelor', 'master', 'phd', 'mba', 'certification', 'diploma'].some((e) => k.includes(e))
  );

  const experienceScore = calculateSectionScore(experienceSection, experienceKeywords.length ? experienceKeywords : jobKeywords.slice(0, 10));
  const educationScore = educationKeywords.length
    ? calculateSectionScore(educationSection, educationKeywords)
    : educationSection.length > 50 ? 75 : 40;

  const formatScore = assessFormat(resumeText);
  const lengthScore = assessLength(resumeText);

  const atsScore = Math.round(
    keywordScore * 0.35 +
    skillsScore * 0.25 +
    experienceScore * 0.2 +
    educationScore * 0.1 +
    formatScore * 0.05 +
    lengthScore * 0.05
  );

  const matchPercentage = jobDescription
    ? Math.round((keywordScore + skillsScore) / 2)
    : atsScore;

  const weakSections = [];
  if (experienceScore < 60) weakSections.push('Experience');
  if (educationScore < 60) weakSections.push('Education');
  if (skillsScore < 60) weakSections.push('Skills');
  if (formatScore < 60) weakSections.push('Formatting');
  if (lengthScore < 60) weakSections.push('Length');

  const recommendations = generateRecommendations({
    missingKeywords: missingKeywords.slice(0, 15),
    missingSkills: missingSkills.slice(0, 10),
    weakSections,
    atsScore,
    resumeText,
  });

  return {
    atsScore: Math.min(100, Math.max(0, atsScore)),
    matchPercentage: Math.min(100, Math.max(0, matchPercentage)),
    keywordScore,
    skillsScore,
    experienceScore,
    educationScore,
    formatScore,
    lengthScore,
    matchedKeywords: matchedKeywords.slice(0, 30),
    missingKeywords: missingKeywords.slice(0, 20),
    matchedSkills,
    missingSkills,
    weakSections,
    recommendations,
    skillsGap: missingSkills,
  };
};

const assessFormat = (text) => {
  let score = 100;
  if (text.length < 200) score -= 30;
  if (!/experience/i.test(text)) score -= 15;
  if (!/education/i.test(text)) score -= 10;
  if (!/skills/i.test(text)) score -= 10;
  const bulletCount = (text.match(/[•\-*]/g) || []).length;
  if (bulletCount < 3) score -= 10;
  return Math.max(0, score);
};

const assessLength = (text) => {
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 150) return 40;
  if (wordCount < 300) return 70;
  if (wordCount <= 800) return 100;
  if (wordCount <= 1200) return 80;
  return 50;
};

const generateRecommendations = ({ missingKeywords, missingSkills, weakSections, atsScore, resumeText }) => {
  const recs = [];

  if (missingKeywords.length > 0) {
    recs.push({
      type: 'keywords',
      priority: 'high',
      title: 'Add missing keywords',
      description: `Include these job-relevant keywords: ${missingKeywords.slice(0, 8).join(', ')}`,
    });
  }

  if (missingSkills.length > 0) {
    recs.push({
      type: 'skills',
      priority: 'high',
      title: 'Address skills gap',
      description: `Add or highlight these skills: ${missingSkills.slice(0, 6).join(', ')}`,
    });
  }

  weakSections.forEach((section) => {
    recs.push({
      type: 'section',
      priority: 'medium',
      title: `Strengthen ${section} section`,
      description: `Your ${section.toLowerCase()} section needs more detail and relevant keywords.`,
    });
  });

  if (atsScore < 70) {
    recs.push({
      type: 'format',
      priority: 'medium',
      title: 'Use ATS-friendly formatting',
      description: 'Use standard section headings, bullet points, and avoid tables or graphics.',
    });
  }

  if (!/quantif|percent|increased|reduced|\d+%/i.test(resumeText)) {
    recs.push({
      type: 'content',
      priority: 'medium',
      title: 'Add quantifiable achievements',
      description: 'Include metrics and numbers to demonstrate impact (e.g., "Increased sales by 25%").',
    });
  }

  if (recs.length === 0) {
    recs.push({
      type: 'general',
      priority: 'low',
      title: 'Resume looks strong',
      description: 'Your resume scores well. Consider tailoring it further for each specific job.',
    });
  }

  return recs;
};

export const generateOptimizedResume = (resumeText, analysis) => {
  let optimized = resumeText;

  if (analysis.missingKeywords.length > 0) {
    const skillsSection = analysis.missingKeywords.slice(0, 8).join(', ');
    if (/skills/i.test(optimized)) {
      optimized = optimized.replace(/(skills[\s\S]*?)(\n\n|\n[A-Z])/i, `$1, ${skillsSection}$2`);
    } else {
      optimized += `\n\nSkills: ${skillsSection}`;
    }
  }

  return optimized;
};

export const extractTextFromFile = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype.startsWith('text/')) {
    return buffer.toString('utf-8');
  }

  throw new Error('Unsupported file format. Please upload PDF or DOCX.');
};
