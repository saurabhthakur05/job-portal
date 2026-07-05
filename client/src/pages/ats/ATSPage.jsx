import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, FileText, Sparkles } from 'lucide-react';
import api from '../../services/api';
import ScoreRing from '../../components/ats/ScoreRing';

const ATSPage = () => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickResult, setQuickResult] = useState(null);

  const handleQuickScan = async () => {
    if (!file && !jobDescription) return toast.error('Upload a resume or paste text');
    setLoading(true);
    try {
      if (isAuthenticated && file) {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        const { data } = await api.post('/ats/analyze', formData);
        navigate(`/ats/report/${data.report._id}`);
      } else {
        const text = file ? await file.text().catch(() => '') : jobDescription;
        const { data } = await api.post('/ats/quick-scan', { resumeText: text || jobDescription, jobDescription });
        setQuickResult(data.analysis);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary-600 mb-4">
            <Sparkles className="w-4 h-4" /> ATS Resume Analyzer
          </span>
          <h1 className="section-title">Check Your Resume ATS Score</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Upload your resume and paste a job description to get keyword analysis, skills gap, and improvement recommendations.
          </p>
        </div>

        <div className="glass-card space-y-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center cursor-pointer hover:border-primary-500 transition-colors"
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <input id="resume-upload" type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            {file ? (
              <p className="font-medium text-primary-600"><FileText className="w-4 h-4 inline mr-2" />{file.name}</p>
            ) : (
              <>
                <p className="font-medium">Drop your resume here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">PDF, DOCX supported</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Description (optional but recommended)</label>
            <textarea
              className="input-field min-h-[150px]"
              placeholder="Paste the job description here for targeted analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button onClick={handleQuickScan} disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>

          {!isAuthenticated && (
            <p className="text-sm text-center text-gray-500">
              <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link> to save reports and track improvements
            </p>
          )}
        </div>

        {quickResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass-card">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <ScoreRing score={quickResult.atsScore} label="ATS Score" />
              <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                {[
                  { label: 'Keywords', score: quickResult.keywordScore },
                  { label: 'Skills', score: quickResult.skillsScore },
                  { label: 'Experience', score: quickResult.experienceScore },
                  { label: 'Education', score: quickResult.educationScore },
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-2xl font-bold text-primary-600">{item.score}%</p>
                    <p className="text-sm text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            {quickResult.missingKeywords?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold mb-2">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {quickResult.missingKeywords.map((k) => <span key={k} className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">{k}</span>)}
                </div>
              </div>
            )}
            {quickResult.recommendations?.length > 0 && (
              <div>
                <h3 className="font-bold mb-3">Recommendations</h3>
                <div className="space-y-3">
                  {quickResult.recommendations.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="font-medium">{r.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ATSPage;
