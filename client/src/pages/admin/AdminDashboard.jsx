import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, Building2, FileText } from 'lucide-react';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';

const COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/pending'),
      api.get('/admin/users?limit=10'),
    ]).then(([dash, pend, usr]) => {
      setData(dash.data);
      setPending(pend.data);
      setUsers(usr.data.users);
    }).finally(() => setLoading(false));
  }, []);

  const moderateJob = async (id, isApproved) => {
    await api.put(`/admin/jobs/${id}`, { isApproved, status: isApproved ? 'active' : 'closed' });
    const { data } = await api.get('/admin/pending');
    setPending(data);
  };

  const moderateUser = async (id, isBlocked) => {
    await api.put(`/admin/users/${id}`, { isBlocked });
    const { data } = await api.get('/admin/users?limit=10');
    setUsers(data.users);
  };

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Users', value: data?.stats?.totalUsers, icon: Users },
    { label: 'Recruiters', value: data?.stats?.totalRecruiters, icon: Building2 },
    { label: 'Jobs', value: data?.stats?.totalJobs, icon: Briefcase },
    { label: 'Applications', value: data?.stats?.totalApplications, icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="glass-card">
            <s.icon className="w-8 h-8 text-primary-500 mb-3" />
            <p className="text-2xl font-bold">{s.value || 0}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {data?.charts?.monthlyApplications?.length > 0 && (
          <div className="glass-card">
            <h2 className="text-lg font-bold mb-4">Applications per Month</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.charts.monthlyApplications.map((d) => ({ month: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {data?.charts?.hiringFunnel?.length > 0 && (
          <div className="glass-card">
            <h2 className="text-lg font-bold mb-4">Hiring Funnel</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.charts.hiringFunnel.map((d) => ({ name: d._id, value: d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.charts.hiringFunnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <h2 className="text-lg font-bold mb-4">Pending Jobs ({pending?.jobs?.length || 0})</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pending?.jobs?.map((job) => (
              <div key={job._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div><p className="font-medium">{job.title}</p><p className="text-sm text-gray-500">{job.companyName}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => moderateJob(job._id, true)} className="btn-primary text-xs py-1 px-3">Approve</button>
                  <button onClick={() => moderateJob(job._id, false)} className="btn-ghost text-xs text-red-500">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card">
          <h2 className="text-lg font-bold mb-4">User Management</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div><p className="font-medium">{user.name}</p><p className="text-sm text-gray-500">{user.email} · {user.role}</p></div>
                <button onClick={() => moderateUser(user._id, !user.isBlocked)} className={`text-xs py-1 px-3 rounded-lg ${user.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
