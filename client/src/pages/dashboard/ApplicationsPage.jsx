import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';
import { getStatusColor, formatDate, APPLICATION_STAGES } from '../../utils/helpers';
import { Check } from 'lucide-react';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my').then((r) => setApplications(r.data.applications)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-gray-500 mb-4">No applications yet</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app, i) => (
            <motion.div key={app._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <Link to={`/jobs/${app.job?._id}`} className="text-lg font-semibold hover:text-primary-600">{app.job?.title}</Link>
                  <p className="text-gray-500">{app.job?.companyName}</p>
                  <p className="text-sm text-gray-400 mt-1">Applied {formatDate(app.createdAt)}</p>
                </div>
                <div className="self-start">
  <span className={`badge capitalize ${getStatusColor(app.status)}`}>
    {app.status?.replace("_", " ")}
  </span>

  {app.status === "interview_scheduled" && (
    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
      {app.interviewDate && (
        <p>📅 <strong>Date:</strong> {formatDate(app.interviewDate)}</p>
      )}

      {app.interviewTime && (
        <p>🕒 <strong>Time:</strong> {app.interviewTime}</p>
      )}

      {app.interviewLocation && (
        <p>📍 <strong>Location:</strong> {app.interviewLocation}</p>
      )}

      {app.interviewLink && (
        <p>
          🎥 <strong>Meeting:</strong>{" "}
          <a
            href={app.interviewLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary-600 underline"
          >
            Join Interview
          </a>
        </p>
      )}
    </div>
  )}
</div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {APPLICATION_STAGES.map((stage, idx) => {
                  const currentIdx = APPLICATION_STAGES.indexOf(app.status);
                  const isComplete = idx <= currentIdx;
                  const isRejected = app.status === 'rejected' && stage !== 'rejected';
                  return (
                    <div key={stage} className="flex items-center gap-2 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isComplete && !isRejected ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                        {isComplete && !isRejected ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className="text-xs capitalize text-gray-500 hidden sm:inline">{stage.replace('_', ' ')}</span>
                      {idx < APPLICATION_STAGES.length - 1 && <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
