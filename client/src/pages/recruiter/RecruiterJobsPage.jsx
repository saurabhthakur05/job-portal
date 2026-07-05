import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { getStatusColor } from '../../utils/helpers';

const RecruiterJobsPage = () => {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', workMode: 'remote', jobType: 'full-time', skills: '', company: '' });
  const [companies, setCompanies] = useState([]);

  const fetchJobs = () => api.get('/jobs/recruiter/mine').then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));

  useEffect(() => {
  fetchJobs();

  api.get('/companies')
    .then((r) => {
      setCompanies(r.data.companies);

      const companyId = new URLSearchParams(location.search).get('company');

      if (companyId) {
        setForm((prev) => ({
          ...prev,
          company: companyId,
        }));
      }
    })
    .catch(() => {});
}, [location.search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', {
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0 },
      });
      toast.success('Job created');
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/jobs/${id}`);
    toast.success('Job deleted');
    fetchJobs();
  };

  const toggleStatus = async (job, status) => {
    await api.put(`/jobs/${job._id}`, { status });
    toast.success(`Job ${status}`);
    fetchJobs();
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Jobs</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Post Job</button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job._id} className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-gray-500">{job.location} · {job.workMode} · {job.applicationCount} applications</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge capitalize ${getStatusColor(job.status)}`}>{job.status}</span>
              <Link to={`/recruiter/applications/${job._id}`} className="btn-ghost"><Users className="w-4 h-4" /> Candidates</Link>
              {job.status === 'active' && <button onClick={() => toggleStatus(job, 'paused')} className="btn-ghost text-sm">Pause</button>}
              {job.status === 'paused' && <button onClick={() => toggleStatus(job, 'active')} className="btn-ghost text-sm">Activate</button>}
              <button onClick={() => toggleStatus(job, 'closed')} className="btn-ghost text-sm">Close</button>
              <button onClick={() => handleDelete(job._id)} className="btn-ghost text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-center text-gray-500 py-12">No jobs posted yet</p>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post a New Job" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <input className="input-field" placeholder="Job Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-field min-h-[120px]" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <select className="input-field" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
              <option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">Onsite</option>
            </select>
          </div>
          <input className="input-field" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Min Salary" type="number" value={form.salaryMin || ''} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            <input className="input-field" placeholder="Max Salary" type="number" value={form.salaryMax || ''} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
          </div>
          {companies.length > 0 && (
            <select className="input-field" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
              <option value="">Select Company</option>
              {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
          <button type="submit" className="btn-primary w-full">Create Job</button>
        </form>
      </Modal>
    </div>
  );
};

export default RecruiterJobsPage;
