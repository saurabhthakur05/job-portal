import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Clock, Building2, Briefcase, DollarSign, Users, Bookmark } from 'lucide-react';
import api from '../../services/api';
import { PageLoader } from '../../components/ui/Spinner';
import { formatSalary, formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then((r) => {
      setJob(r.data.job);
      setIsSaved(r.data.isSaved);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!isAuthenticated) return toast.error('Please login to save jobs');
    const { data } = await api.post(`/users/saved-jobs/${id}`);
    setIsSaved(data.saved);
    toast.success(data.saved ? 'Job saved' : 'Job removed');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      const resumeFile = e.target.resume?.files[0];
      if (resumeFile) formData.append('resume', resumeFile);
      await api.post(`/applications/${id}`, formData);
      toast.success('Application submitted!');
      setShowApply(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    }
    setApplying(false);
  };

  const generateCoverLetter = async () => {
    try {
      const { data } = await api.post('/admin/ai/cover-letter', { jobId: id });
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter generated!');
    } catch {
      toast.error('Failed to generate cover letter');
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return <div className="text-center py-20">Job not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {job.company?.logo ? <img src={job.company.logo} alt="" className="w-full h-full rounded-2xl object-cover" /> : job.companyName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                <Link to={`/companies/${job.company?._id}`} className="text-primary-600 hover:underline flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" /> {job.companyName}
                </Link>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                  <span className="flex items-center gap-1 capitalize"><Briefcase className="w-4 h-4" />{job.workMode} · {job.jobType?.replace('-', ' ')}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatSalary(job.salary)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={handleSave} className="btn-secondary">
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary-500 text-primary-500' : ''}`} />
              </button>
              {user?.role === 'jobseeker' && (
                <button onClick={() => setShowApply(true)} className="btn-primary">Apply Now</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{job.description}</p>
            </div>
            {job.responsibilities?.length > 0 && (
              <div className="glass-card">
                <h2 className="text-xl font-bold mb-4">Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {job.requirements?.length > 0 && (
              <div className="glass-card">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                  {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="glass-card">
              <h3 className="font-bold mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((s) => <span key={s} className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{s}</span>)}
              </div>
            </div>
            {job.experience && (
              <div className="glass-card">
                <h3 className="font-bold mb-2">Experience</h3>
                <p className="text-gray-600 dark:text-gray-400">{job.experience.min}{job.experience.max ? `-${job.experience.max}` : '+'} years</p>
              </div>
            )}
            <div className="glass-card flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4" />
              {job.applicationCount || 0} applicants
            </div>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply for this job" size="lg">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Resume (optional if on profile)</label>
            <input type="file" name="resume" accept=".pdf,.doc,.docx" className="input-field" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Cover Letter</label>
              <button type="button" onClick={generateCoverLetter} className="text-sm text-primary-600 hover:underline">AI Generate</button>
            </div>
            <textarea className="input-field min-h-[150px]" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write your cover letter..." />
          </div>
          <button type="submit" disabled={applying} className="btn-primary w-full">
            {applying ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetailsPage;
