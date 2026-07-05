import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Download, Sparkles, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import api from '../../services/api';
import { RESUME_TEMPLATES } from '../../utils/helpers';

const ResumeBuilderPage = () => {
const [template, setTemplate] = useState('modern');
 const [content, setContent] = useState({
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',

  summary: '',
  skills: [],

  experience: [
    {
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      bullets: [''],
    },
  ],

  education: [
    {
      institution: '',
      degree: '',
      field: '',
      year: '',
    },
  ],
  projects: [
  {
    title: '',
    description: '',
    tech: '',
  },
],
});
const resumeScore = (() => {
  let score = 0;

  if (content.name) score += 15;
  if (content.email) score += 10;
  if (content.phone) score += 10;
  if (content.summary) score += 15;
  if (content.skills.length >= 5) score += 20;
  if (content.experience.some(e => e.title)) score += 15;
  if (content.education.some(e => e.institution)) score += 10;
  if (content.projects.some(p => p.title)) score += 5;

  return score;
})();

  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const addExperience = () => setContent({ ...content, experience: [...content.experience, { company: '', title: '', startDate: '', endDate: '', bullets: [''] }] });
  const addEducation = () => setContent({ ...content, education: [...content.education, { institution: '', degree: '', field: '', year: '' }] });

  const getSuggestions = async () => {
    const { data } = await api.post('/resumes/suggestions', {});
    setSuggestions(data.suggestions);
  };

  const optimizeBullet = async (expIdx, bulletIdx) => {
    const bullet = content.experience[expIdx].bullets[bulletIdx];
    const { data } = await api.post('/resumes/optimize-bullet', { bullet });
    const updated = [...content.experience];
    updated[expIdx].bullets[bulletIdx] = data.improved;
    setContent({ ...content, experience: updated });
    toast.success('Bullet optimized!');
  };

  const saveResume = async () => {
    await api.post('/resumes', { title: 'My Resume', template, content });
    toast.success('Resume saved!');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.text('Professional Resume', 20, y);
    y += 15;
    if (content.summary) {
      doc.setFontSize(12);
      doc.text(content.summary, 20, y, { maxWidth: 170 });
      y += 20;
    }
    if (content.skills.length) {
      doc.setFontSize(14);
      doc.text('Skills', 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(content.skills.join(', '), 20, y);
      y += 15;
    }
    content.experience.forEach((exp) => {
      if (exp.title) {
        doc.setFontSize(13);
        doc.text(`${exp.title} — ${exp.company}`, 20, y);
        y += 7;
        doc.setFontSize(10);
        exp.bullets.filter(Boolean).forEach((b) => {
          doc.text(`• ${b}`, 25, y, { maxWidth: 165 });
          y += 6;
        });
        y += 5;
      }
    });
    doc.save('resume.pdf');
    toast.success('PDF downloaded!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Resume Builder</h1>
          <p className="text-gray-500 mt-2">Create ATS-friendly resumes with live preview</p>
        </div>
       <div className="flex items-center gap-4 flex-wrap">

  <div className="glass-card px-5 py-3 text-center">
    <p className="text-xs text-gray-500">Resume Score</p>

    <h2 className="text-2xl font-bold text-primary-600">
      {resumeScore}%
    </h2>
  </div>

  <button onClick={getSuggestions} className="btn-secondary">
    <Sparkles className="w-4 h-4" />
    AI Suggestions
  </button>

  <button onClick={saveResume} className="btn-secondary">
    Save
  </button>

  <button onClick={downloadPDF} className="btn-primary">
    <Download className="w-4 h-4" />
    Download PDF
  </button>

</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card space-y-4 border-l-4 border-primary-500">
             <h3 className="font-bold text-primary-600">Professional Summary</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {RESUME_TEMPLATES.map((t) => (
                <button key={t} onClick={() => setTemplate(t)} className={`p-3 rounded-xl border-2 capitalize text-sm ${template === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'}`}>{t}</button>
              ))}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="glass-card bg-primary-50/50 dark:bg-primary-900/10">
              <h3 className="font-bold mb-2">AI Suggestions</h3>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {suggestions.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
          )}

          <div className="glass-card space-y-4">
            <div className="glass-card space-y-4">
  <h3 className="font-bold">Personal Information</h3>

  <input
    className="input-field"
    placeholder="Full Name"
    value={content.name || ""}
    onChange={(e) =>
      setContent({ ...content, name: e.target.value })
    }
  />

  <div className="grid grid-cols-2 gap-3">
    <input
      className="input-field"
      placeholder="Email"
      value={content.email || ""}
      onChange={(e) =>
        setContent({ ...content, email: e.target.value })
      }
    />

    <input
      className="input-field"
      placeholder="Phone"
      value={content.phone || ""}
      onChange={(e) =>
        setContent({ ...content, phone: e.target.value })
      }
    />
  </div>

  <div className="grid grid-cols-2 gap-3">
    <input
      className="input-field"
      placeholder="Location"
      value={content.location || ""}
      onChange={(e) =>
        setContent({ ...content, location: e.target.value })
      }
    />

    <input
      className="input-field"
      placeholder="LinkedIn URL"
      value={content.linkedin || ""}
      onChange={(e) =>
        setContent({ ...content, linkedin: e.target.value })
      }
    />
  </div>
</div>
            <h3 className="font-bold">Summary</h3>
            <textarea className="input-field min-h-[80px]" value={content.summary} onChange={(e) => setContent({ ...content, summary: e.target.value })} placeholder="Professional summary..." />
          </div>

          <div className="glass-card space-y-4">
           <h3 className="font-bold text-primary-600">Core Skills</h3>
            <div className="flex gap-2">
              <input className="input-field flex-1" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setContent({ ...content, skills: [...content.skills, skillInput.trim()] }); setSkillInput(''); } } }} placeholder="Add skill..." />
            </div>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((s, i) => (
                <span key={i} className="badge bg-primary-100 text-primary-700 cursor-pointer" onClick={() => setContent({ ...content, skills: content.skills.filter((_, j) => j !== i) })}>{s} ×</span>
              ))}
            </div>
          </div>

          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary-600">Work Experience</h3>
              <button onClick={addExperience} className="btn-ghost text-sm"><Plus className="w-4 h-4" /> Add</button>
            </div>
            {content.experience.map((exp, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-3">
                <input className="input-field" placeholder="Job Title" value={exp.title} onChange={(e) => { const u = [...content.experience]; u[i].title = e.target.value; setContent({ ...content, experience: u }); }} />
                <input className="input-field" placeholder="Company" value={exp.company} onChange={(e) => { const u = [...content.experience]; u[i].company = e.target.value; setContent({ ...content, experience: u }); }} />
                {exp.bullets.map((b, j) => (
                  <div key={j} className="flex gap-2">
                    <input className="input-field flex-1" placeholder="Achievement bullet point" value={b} onChange={(e) => { const u = [...content.experience]; u[i].bullets[j] = e.target.value; setContent({ ...content, experience: u }); }} />
                    <button onClick={() => optimizeBullet(i, j)} className="btn-ghost shrink-0" title="AI Optimize"><Sparkles className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between">
             <h3 className="font-bold text-primary-600">Education Background</h3>
              <button onClick={addEducation} className="btn-ghost text-sm"><Plus className="w-4 h-4" /> Add</button>
            </div>
            <div className="glass-card space-y-4">
  <div className="flex items-center justify-between">
    <h3 className="font-bold text-primary-600">Projects</h3>
  </div>

  <div className="space-y-3">
    {content.projects.map((proj, i) => (
      <div key={i} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        
        <input
          className="input-field"
          placeholder="Project Title"
          value={proj.title}
          onChange={(e) => {
            const updated = [...content.projects];
            updated[i].title = e.target.value;
            setContent({ ...content, projects: updated });
          }}
        />

        <input
          className="input-field"
          placeholder="Description"
          value={proj.description}
          onChange={(e) => {
            const updated = [...content.projects];
            updated[i].description = e.target.value;
            setContent({ ...content, projects: updated });
          }}
        />

        <input
          className="input-field"
          placeholder="Tech Stack (React, Node, MongoDB)"
          value={proj.tech}
          onChange={(e) => {
            const updated = [...content.projects];
            updated[i].tech = e.target.value;
            setContent({ ...content, projects: updated });
          }}
        />
      </div>
    ))}
  </div>
</div>
            {content.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="Institution" value={edu.institution} onChange={(e) => { const u = [...content.education]; u[i].institution = e.target.value; setContent({ ...content, education: u }); }} />
                <input className="input-field" placeholder="Degree" value={edu.degree} onChange={(e) => { const u = [...content.education]; u[i].degree = e.target.value; setContent({ ...content, education: u }); }} />
              </div>
            ))}
          </div>
        </div>

       <motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  className="glass-card sticky top-24 lg:min-w-[650px]"
>
          <h3 className="font-bold mb-4 text-center">Live Preview</h3>
         <div
  className={`p-8 rounded-xl min-h-[600px] shadow-inner transition-all duration-300

  ${
    template === "modern"
      ? "bg-white border-l-8 border-primary-500 text-gray-900"

      : template === "classic"
      ? "bg-white border border-gray-300 font-serif"

      : template === "minimal"
      ? "bg-gray-50 text-gray-900"

      : template === "professional"
      ? "bg-slate-50 border-t-8 border-slate-700"

      : "bg-gradient-to-br from-blue-50 to-purple-50"
  }
`}
>
      {template === "modern" ? (
  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6">
    <h1 className="text-4xl font-bold">
      {content.name || "Your Name"}
    </h1>

    <div className="flex flex-wrap gap-6 mt-3 text-sm opacity-95">
      {content.email && <span> {content.email}</span>}
      {content.phone && <span> {content.phone}</span>}
      {content.location && <span>📍 {content.location}</span>}
      {content.linkedin && <span>🔗 {content.linkedin}</span>}
    </div>
  </div>
) : (
  <div className="border-b-2 border-primary-500 pb-5 mb-6">
    <h1 className="text-3xl font-bold">
      {content.name || "Your Name"}
    </h1>

    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
      {content.email && <span>{content.email}</span>}
      {content.phone && <span>{content.phone}</span>}
      {content.location && <span>{content.location}</span>}
      {content.linkedin && <span>{content.linkedin}</span>}
    </div>
  </div>
)}
            {content.summary && <p className="text-sm text-gray-600 mb-4">{content.summary}</p>}
            {content.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary-600 mb-2">Skills</h2>
                <p className="text-sm">{content.skills.join(' • ')}</p>
              </div>
            )}
            {content.experience.some((e) => e.title) && (
              <div className="mb-4">
               <h2 className="text-lg font-bold border-b-2 border-primary-500 pb-1 mb-4 uppercase tracking-wide"> Experience</h2>
                {content.experience.filter((e) => e.title).map((exp, i) => (
                  <div key={i} className="mb-5">

  <div className="flex justify-between items-start">
    <div>
      <h3 className="font-bold text-base">
        {exp.title}
      </h3>

      <p className="text-sm text-primary-600">
        {exp.company}
      </p>
    </div>

    <div className="text-xs text-gray-500">
      {exp.startDate}
      {exp.startDate && exp.endDate && " - "}
      {exp.endDate}
    </div>
  </div>

  <ul className="mt-3 ml-5 list-disc text-sm space-y-1">
    {exp.bullets
      .filter(Boolean)
      .map((b, j) => (
        <li key={j}>{b}</li>
      ))}
  </ul>

</div>
                ))}
              </div>
            )}
            {content.education.some((e) => e.institution) && (
              <div>
               <h2 className="text-lg font-bold border-b-2 border-primary-500 pb-1 mb-4 uppercase tracking-wide">Education </h2>
                {content.education.filter((e) => e.institution).map((edu, i) => (
                  <p key={i} className="text-sm">{edu.degree} — {edu.institution}</p>
                ))}
              </div>
            )}
            {content.projects.some((p) => p.title) && (
  <div className="mt-4">
   <h2 className="text-lg font-bold border-b-2 border-primary-500 pb-1 mb-4 uppercase tracking-wide"> Projects </h2>

    {content.projects
      .filter((p) => p.title)
      .map((project, i) => (
        <div key={i} className="mb-3">
          <p className="font-semibold text-sm">
            {project.title}
          </p>

          {project.description && (
            <p className="text-sm text-gray-600">
              {project.description}
            </p>
          )}

          {project.tech && (
            <p className="text-xs text-primary-600 mt-1">
              <strong>Tech Stack:</strong> {project.tech}
            </p>
          )}
        </div>
      ))}
  </div>
)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
