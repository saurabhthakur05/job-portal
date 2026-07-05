import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, TrendingUp, Pause } from 'lucide-react';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';
import { getStatusColor } from '../../utils/helpers';

const RecruiterDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Jobs', value: data?.stats?.totalJobs, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Jobs', value: data?.stats?.activeJobs, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Applications', value: data?.stats?.totalApplications, icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Paused', value: data?.stats?.pausedJobs, icon: Pause, color: 'from-amber-500 to-orange-500' },
  ];

 return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <div className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold">
        Welcome back, {user?.name || "Recruiter"} 👋
      </h1>

      <p className="mt-2 text-blue-100">
        Manage job postings, review applications, and hire the best talent.
      </p>
    </div>

    <Link to="/recruiter/jobs" className="bg-white text-blue-700 px-5 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
      Manage Jobs
    </Link>
  </div>
  </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.value || 0}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {data?.monthlyApplications?.length > 0 && (
        <div className="glass-card mb-8">
          <h2 className="text-xl font-bold mb-6">Applications per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyApplications.map((d) => ({ month: d._id, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card">
        <h2 className="text-xl font-bold mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {data?.recentApplications?.map((app) => (
            <div key={app._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="font-medium">{app.applicant?.name}</p>
                <p className="text-sm text-gray-500">{app.job?.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary-600">ATS: {app.atsScore}</span>
                <span className={`badge capitalize ${getStatusColor(app.status)}`}>{app.status?.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
