import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">JobPortal</span>
          </div>
          <p className="text-gray-400 max-w-md">
            Your all-in-one career platform. Find jobs, optimize your resume with ATS scoring,
            and connect with top employers worldwide.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">For Job Seekers</h4>
          <ul className="space-y-2">
            <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
            <li><Link to="/ats" className="hover:text-white transition-colors">ATS Resume Checker</Link></li>
            <li><Link to="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
            <li><Link to="/companies" className="hover:text-white transition-colors">Companies</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-4">For Employers</h4>
          <ul className="space-y-2">
            <li><Link to="/register" className="hover:text-white transition-colors">Post a Job</Link></li>
            <li><Link to="/recruiter" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
            <li><Link to="/ats" className="hover:text-white transition-colors">Resume Screening</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors" aria-label="GitHub"><Github className="w-5 h-5" /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
