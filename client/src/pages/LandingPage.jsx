import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Shield, Zap, Star, ChevronDown } from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/jobs/JobCard';
import CompanyCard from '../components/companies/CompanyCard';

const faqs = [
  { q: 'How does the ATS resume checker work?', a: 'Upload your resume and optionally paste a job description. Our analyzer extracts text, compares keywords and skills, and provides an ATS score with actionable recommendations.' },
  { q: 'Is JobPortal free for job seekers?', a: 'Yes! Job seekers can search jobs, build resumes, use the ATS checker, and apply to positions for free.' },
  { q: 'How do recruiters screen candidates?', a: 'Recruiters get automatic ATS scoring and candidate ranking based on skills match, experience, and education alignment.' },
  { q: 'Can I use Google to sign in?', a: 'Yes, we support Google OAuth for quick and secure authentication alongside email registration.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer', text: 'The ATS checker helped me improve my resume score from 62 to 89. I landed 3 interviews in two weeks!', rating: 5 },
  { name: 'Marcus Johnson', role: 'HR Director', text: 'Candidate ranking by ATS score saves our team hours every week. Best recruiting tool we have used.', rating: 5 },
  { name: 'Priya Sharma', role: 'Product Designer', text: 'Beautiful UI, smart job recommendations, and the resume builder is incredibly intuitive.', rating: 5 },
];

const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get('/jobs/featured').then((r) => setFeaturedJobs(r.data.jobs)).catch(() => {});
    api.get('/companies/top').then((r) => setTopCompanies(r.data.companies)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-accent-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
           
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Find Your <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Dream Job</span>
              <br />With Smart Tools
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              Search thousands of jobs, optimize your resume with ATS scoring, and connect with top companies — all in one modern platform.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`; }}
              className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2 glass rounded-2xl"
            >
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company..."
                  className="flex-1 py-3 bg-transparent outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Search Jobs <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[{ icon: Shield, label: 'ATS Resume Scanner' }, { icon: Zap, label: 'AI Job Matching' },].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-gray-500">
                  <item.icon className="w-4 h-4 text-primary-500" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-3">Free ATS Resume Checker</h2>
            <p className="text-primary-100 max-w-lg">Get your ATS score, missing keywords, and improvement tips in seconds. Stand out from the competition.</p>
          </div>
          <Link to="/ats" className="btn-secondary bg-white text-primary-600 hover:bg-gray-50 shrink-0">
            Check Your Resume <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="section-title">Featured Jobs</h2>
            <Link to="/jobs" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.length > 0 ? featuredJobs.map((job, i) => (
              <JobCard key={job._id} job={job} index={i} />
            )) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="glass-card animate-pulse h-48" />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-10">Top Companies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCompanies.map((c, i) => <CompanyCard key={c._id} company={c} index={i} />)}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">FAQs</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold pr-4">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === i && <p className="mt-3 text-gray-600 dark:text-gray-400">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
