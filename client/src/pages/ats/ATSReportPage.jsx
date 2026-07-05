import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import ScoreRing from '../../components/ats/ScoreRing';
import { PageLoader } from '../../components/ui/Spinner';
import { getScoreColor } from '../../utils/helpers';

const ATSReportPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ats/reports/${id}`).then((r) => setReport(r.data.report)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!report) return <div className="text-center py-20">Report not found</div>;

  const scores = [
    { label: 'Keyword Match', score: report.keywordScore },
    { label: 'Skills Match', score: report.skillsScore },
    { label: 'Experience Match', score: report.experienceScore },
    { label: 'Education Match', score: report.educationScore },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-8">ATS Analysis Report</h1>

        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={report.atsScore} size={140} label="Overall ATS Score" />
            <div className="flex-1 w-full">
              <p className="text-lg mb-4">Match Percentage: <span className={`font-bold ${getScoreColor(report.matchPercentage)}`}>{report.matchPercentage}%</span></p>
              <div className="grid grid-cols-2 gap-4">
                {scores.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.label}</span>
                      <span className="font-medium">{s.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <h3 className="font-bold mb-3 text-green-600">Matched Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {report.matchedKeywords?.map((k) => <span key={k} className="badge bg-green-100 text-green-700 dark:bg-green-900/30">{k}</span>)}
            </div>
          </div>
          <div className="glass-card">
            <h3 className="font-bold mb-3 text-red-600">Missing Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {report.missingKeywords?.map((k) => <span key={k} className="badge bg-red-100 text-red-700 dark:bg-red-900/30">{k}</span>)}
            </div>
          </div>
        </div>

        {report.weakSections?.length > 0 && (
          <div className="glass-card mb-6">
            <h3 className="font-bold mb-3">Weak Sections</h3>
            <div className="flex flex-wrap gap-2">
              {report.weakSections.map((s) => <span key={s} className="badge bg-amber-100 text-amber-700">{s}</span>)}
            </div>
          </div>
        )}

        <div className="glass-card mb-6">
          <h3 className="font-bold mb-4">Improvement Recommendations</h3>
          <div className="space-y-3">
            {report.recommendations?.map((r, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <span className={`badge shrink-0 ${r.priority === 'high' ? 'bg-red-100 text-red-700' : r.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{r.priority}</span>
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {report.optimizedText && (
          <div className="glass-card">
            <h3 className="font-bold mb-3">Optimized Resume Version</h3>
            <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl max-h-96 overflow-y-auto">{report.optimizedText}</pre>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ATSReportPage;
