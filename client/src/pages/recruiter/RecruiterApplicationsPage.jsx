import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { getStatusColor } from '../../utils/helpers';

const RecruiterApplicationsPage = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewTime, setInterviewTime] = useState("");

  useEffect(() => {
    api.get(`/applications/job/${jobId}`).then((r) => {
      setApplications(r.data.applications);
      setJob(r.data.job);
    }).finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    toast.success(`Status updated to ${status}`);
    const { data } = await api.get(`/applications/job/${jobId}`);
    setApplications(data.applications);
  };
const scheduleInterview = async () => {
  await api.post("/interviews", {
  applicationId: selectedApp._id,
  scheduledAt: interviewDate,
  location: interviewLocation,
  interviewTime: interviewTime,
  type: "video",
});

  toast.success("Interview scheduled");

  setSelectedApp(null);
  setInterviewDate("");
  setInterviewLocation("");
  setInterviewTime("");

  const { data } = await api.get(`/applications/job/${jobId}`);
  setApplications(data.applications);
};

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-2">Candidates</h1>
      <p className="text-gray-500 mb-8">{job?.title} — Ranked by ATS Score</p>

      <div className="space-y-4">
        {applications.map((app, i) => (
          <div key={app._id} className="glass-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">#{i + 1}</div>
                <div>
                  <p className="font-semibold">{app.applicant?.name}</p>
                  <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{app.atsScore}</p>
                  <p className="text-xs text-gray-500">ATS Score</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{app.matchPercentage}%</p>
                  <p className="text-xs text-gray-500">Match</p>
                </div>
               <div className="text-right">
  <span className={`badge capitalize ${getStatusColor(app.status)}`}>
    {app.status?.replace("_", " ")}
  </span>

  {app.status === "interview_scheduled" && app.interviewDate && (
    <div className="mt-2 text-xs text-gray-500">
      <p>
        📅 {new Date(app.interviewDate).toLocaleDateString()}
      </p>

      {app.interviewTime && (
        <p>
          🕒 {app.interviewTime}
        </p>
      )}
    </div>
  )}
</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button onClick={() => updateStatus(app._id, 'shortlisted')} className="btn-ghost text-sm"><Star className="w-4 h-4" /> Shortlist</button>
              <button onClick={() => { setSelectedApp(app); }} className="btn-ghost text-sm"><Calendar className="w-4 h-4" /> Schedule Interview</button>
              <button onClick={() => updateStatus(app._id, 'rejected')} className="btn-ghost text-sm text-red-500">Reject</button>
            </div>
          </div>
        ))}
        {applications.length === 0 && <p className="text-center text-gray-500 py-12">No applications yet</p>}
      </div>

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={`Schedule Interview — ${selectedApp?.applicant?.name}`}>
        <div className="space-y-4">
  <input
    type="date"
    className="input-field"
    value={interviewDate}
    onChange={(e) => setInterviewDate(e.target.value)}
  />

  <input
    type="text"
    placeholder="Interview Location / Google Meet Link"
    className="input-field"
    value={interviewLocation}
    onChange={(e) => setInterviewLocation(e.target.value)}
  />
  <input
  type="time"
  className="input-field"
  value={interviewTime}
  onChange={(e) => setInterviewTime(e.target.value)}
/>

  <button
    onClick={scheduleInterview}
    className="btn-primary w-full"
  >
    Schedule
  </button>
</div>
      </Modal>
    </div>
  );
};

export default RecruiterApplicationsPage;
