import { analyzeResume } from './atsAnalyzer.js';

export const generateResumeSuggestions = (profile, jobDescription = '') => {
  const suggestions = [];

  if (!profile?.skills?.length) {
    suggestions.push('Add at least 5 relevant skills to your profile.');
  }
  if (!profile?.experience?.length) {
    suggestions.push('Include your work experience with quantifiable achievements.');
  }
  if (!profile?.education?.length) {
    suggestions.push('Add your educational background.');
  }
  if (!profile?.summary) {
    suggestions.push('Write a compelling professional summary (2-3 sentences).');
  }

  profile?.experience?.forEach((exp, i) => {
    if (!exp.description || exp.description.length < 50) {
      suggestions.push(`Expand description for ${exp.title || `experience #${i + 1}`} with bullet points.`);
    }
  });

  if (jobDescription) {
    const analysis = analyzeResume(
      JSON.stringify(profile),
      jobDescription
    );
    analysis.recommendations.forEach((r) => suggestions.push(r.description));
  }

  return [...new Set(suggestions)].slice(0, 10);
};

export const rewriteBulletPoint = (bullet, context = '') => {
  const actionVerbs = ['Led', 'Developed', 'Implemented', 'Optimized', 'Managed', 'Designed', 'Increased', 'Reduced'];
  const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

  let improved = bullet.trim();
  if (!/^[A-Z]/.test(improved)) {
    improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  }
  if (!/^(Led|Developed|Implemented|Managed|Created|Built|Designed|Optimized|Increased|Reduced)/i.test(improved)) {
    improved = `${verb} ${improved.charAt(0).toLowerCase() + improved.slice(1)}`;
  }
  if (!/\d/.test(improved) && context) {
    improved += ', resulting in measurable improvements';
  }
  if (!improved.endsWith('.')) improved += '.';

  return improved;
};

export const generateCoverLetter = ({ user, job, company }) => {
  const skills = user?.profile?.skills?.slice(0, 5).join(', ') || 'relevant technical skills';
  const experience = user?.profile?.experience?.[0];

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${company?.name || job.companyName}. With my background in ${experience?.title || 'the field'} and expertise in ${skills}, I am confident I would be a valuable addition to your team.

In my previous role${experience?.company ? ` at ${experience.company}` : ''}, I have developed skills that align closely with your requirements. ${experience?.description?.slice(0, 200) || 'I have consistently delivered results and collaborated effectively with cross-functional teams.'}

I am particularly drawn to ${company?.name || 'your company'}'s mission and culture. I believe my combination of technical skills and passion for excellence would enable me to contribute meaningfully to your team.

I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for considering my application.

Sincerely,
${user.name}`;
};

export const chatbotResponse = (message, user) => {
  const lower = message.toLowerCase();

  if (lower.includes('resume') || lower.includes('cv')) {
    return {
      reply: 'For a strong resume: use action verbs, quantify achievements, tailor keywords to each job, and keep it to 1-2 pages. Try our ATS Resume Checker to get a detailed score!',
      suggestions: ['How to improve ATS score?', 'Resume format tips', 'Skills to highlight'],
    };
  }

  if (lower.includes('interview')) {
    return {
      reply: 'Interview prep tips: Research the company thoroughly, prepare STAR method stories, practice common questions, and prepare thoughtful questions to ask the interviewer.',
      suggestions: ['Common interview questions', 'STAR method examples', 'Salary negotiation tips'],
    };
  }

  if (lower.includes('skill')) {
    const skills = user?.profile?.skills?.length
      ? `Based on your profile, consider deepening: ${user.profile.skills.slice(0, 3).join(', ')}. Also explore trending skills in your field.`
      : 'Complete your profile skills section to get personalized skill recommendations.';
    return {
      reply: skills,
      suggestions: ['Top skills for tech', 'How to learn new skills', 'Certification recommendations'],
    };
  }

  if (lower.includes('salary') || lower.includes('negotiat')) {
    return {
      reply: 'Salary negotiation: Research market rates, know your worth, wait for the right moment, and consider the full compensation package beyond base salary.',
      suggestions: ['Salary research tools', 'When to negotiate', 'Benefits to consider'],
    };
  }

  return {
    reply: `I'm your AI Career Assistant! I can help with resume tips, interview preparation, skill recommendations, and career guidance. What would you like to know?`,
    suggestions: ['Resume tips', 'Interview prep', 'Skill recommendations', 'Career change advice'],
  };
};
