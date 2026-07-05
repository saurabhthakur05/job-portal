import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { PageLoader } from '../../components/ui/Spinner';
import { JOB_TYPES, WORK_MODES } from '../../utils/helpers';

const JobsPage = () => {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    location: '',
    workMode: '',
    jobType: '',
    salaryMin: '',
    experience: '',
  });

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page, limit: 12 });
      Object.entries(filters).forEach(([k, v]) => v && query.set(k, v));
      const { data } = await api.get(`/jobs?${query}`);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSuggest = async (q) => {
    setFilters((f) => ({ ...f, search: q }));
    if (q.length >= 2) {
      const { data } = await api.get(`/jobs/suggestions?q=${q}`);
      setSuggestions(data.suggestions);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title mb-2">Find Your Next Role</h1>
        <p className="text-gray-500 mb-8">Discover opportunities from top companies worldwide</p>

        <form onSubmit={handleSearch} className="glass-card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="input-field pl-10"
                placeholder="Search jobs, skills, companies..."
                value={filters.search}
                onChange={(e) => handleSuggest(e.target.value)}
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card z-10 py-2">
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { setFilters((f) => ({ ...f, search: s.text })); setSuggestions([]); }}>
                      <span className="font-medium">{s.text}</span>
                      {s.sub && <span className="text-gray-400 text-sm ml-2">{s.sub}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input className="input-field lg:w-48" placeholder="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary lg:w-auto">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button type="submit" className="btn-primary">Search</button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <select className="input-field" value={filters.workMode} onChange={(e) => setFilters({ ...filters, workMode: e.target.value })}>
                <option value="">Work Mode</option>
                {WORK_MODES.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
              </select>
              <select className="input-field" value={filters.jobType} onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}>
                <option value="">Job Type</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
              </select>
              <input className="input-field" placeholder="Min Salary" type="number" value={filters.salaryMin} onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })} />
              <input className="input-field" placeholder="Experience (years)" type="number" value={filters.experience} onChange={(e) => setFilters({ ...filters, experience: e.target.value })} />
            </div>
          )}
        </form>

        {loading ? <PageLoader /> : (
          <>
            <p className="text-sm text-gray-500 mb-4">{pagination.total || 0} jobs found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
            </div>
            {jobs.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No jobs found</p>
                <button onClick={() => { setFilters({ search: '', location: '', workMode: '', jobType: '', salaryMin: '', experience: '' }); fetchJobs(); }} className="btn-ghost mt-4">
                  <X className="w-4 h-4" /> Clear filters
                </button>
              </div>
            )}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchJobs(p)} className={`px-4 py-2 rounded-lg ${p === pagination.page ? 'bg-primary-600 text-white' : 'glass'}`}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default JobsPage;
