import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Bookmark, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { PageLoader } from '../../components/ui/Spinner';
import { getStatusColor } from '../../utils/helpers';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [aiJobs, setAiJobs] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const loadDashboard = async () => {
    try {
      const [dashboardRes, aiRes] = await Promise.all([
        api.get("/users/dashboard"),
        api.get("/jobs/recommended"),
      ]);

      setData(dashboardRes.data);
      setAiJobs(aiRes.data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Profile Completion', value: `${data?.stats?.profileCompletion || 0}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Applications', value: data?.stats?.applications || 0, icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Saved Jobs', value: data?.stats?.savedJobs || 0, icon: Bookmark, color: 'from-purple-500 to-pink-500' },
    { label: 'Recommended', value: data?.recommendedJobs?.length || 0, icon: Briefcase, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="mb-8 rounded-3xl bg-gradient-to-r from-primary-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
  <h1 className="text-4xl font-bold">
   Welcome back, {user?.name || "User"} 👋
  </h1>

  <p className="mt-2 text-primary-100">
  {user?.role === "recruiter"
    ? "Manage job postings, review applications, and hire the best talent."
    : "Find your next opportunity and track your career journey."}
</p>
</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {data?.stats?.profileCompletion < 100 && (
        <div className="glass-card mb-8 bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Complete your profile for better job matches</p>
            <Link to="/profile" className="text-primary-600 text-sm hover:underline">Edit Profile</Link>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all" style={{ width: `${data.stats.profileCompletion}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
  🤖 AI Recommended Jobs
</h2>
            <Link to="/jobs" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
           {aiJobs.slice(0, 3).map((job, i) => (
  <div
    key={job._id}
    className="glass-card border border-primary-200 dark:border-primary-700"
  >
    <div className="flex justify-between items-center mb-2">
      <div>
        <h3 className="font-semibold">{job.title}</h3>
        <p className="text-sm text-gray-500">
          {job.companyName}
        </p>
      </div>

     <span
  className={`px-3 py-1 rounded-full text-sm font-semibold ${
    job.matchPercentage >= 80
      ? "bg-green-100 text-green-700"
      : job.matchPercentage >= 50
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {job.matchPercentage}% Match
</span>
    </div>

    <p className="text-sm text-gray-500 mb-2">
      Matching Skills:
    </p>

    <div className="flex flex-wrap gap-2">
  {job.matchedSkills.map((skill) => (
    <span
      key={skill}
      className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs"
    >
      {skill}
    </span>
  ))}
</div>

{job.matchReason && (
  <p className="text-sm text-gray-600 mt-3">
    🤖 {job.matchReason}
  </p>
)}
{job.missingSkills?.length > 0 && (
  <>
    <p className="text-sm text-gray-500 mt-3">
      Missing Skills:
    </p>

    <div className="flex flex-wrap gap-2 mt-2">
      {job.missingSkills.map((skill) => (
        <span
          key={skill}
          className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs"
        >
          {skill}
        </span>
      ))}
    </div>
  </>
)}
{job.missingSkills?.length > 0 && (
  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
    <p className="font-medium text-blue-700">
      💡 AI Suggestions
    </p>

    <p className="text-sm text-gray-600 mt-1">
      Learn <strong>{job.missingSkills.join(", ")}</strong> to improve your
      chances for this role.
    </p>
  </div>
)}

    <Link
      to={`/jobs/${job._id}`}
      className="text-primary-600 text-sm mt-4 inline-block"
    >
      View Job →
    </Link>
  </div>
))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link to="/dashboard/applications" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data?.recentApplications?.map((app) => (
              <div key={app._id} className="glass-card flex items-center justify-between">
                <div>
                  <p className="font-medium">{app.job?.title}</p>
                  <p className="text-sm text-gray-500">{app.job?.companyName}</p>
                </div>
                <span className={`badge capitalize ${getStatusColor(app.status)}`}>{app.status?.replace('_', ' ')}</span>
              </div>
            ))}
            {(!data?.recentApplications || data.recentApplications.length === 0) && (
              <p className="text-gray-500 text-center py-8">No applications yet. <Link to="/jobs" className="text-primary-600">Browse jobs</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
