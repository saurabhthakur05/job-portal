import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatSalary, formatDate } from '../../utils/helpers';

const JobCard = ({ job, isSaved, onSave, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card group hover:border-primary-300 dark:hover:border-primary-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {job.company?.logo ? (
              <img src={job.company.logo} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              job.companyName?.[0] || 'J'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/jobs/${job._id}`} className="block">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                {job.title}
              </h3>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <Building2 className="w-4 h-4" />
              {job.companyName || job.company?.name}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location}
              </span>
              <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 capitalize">
                {job.workMode}
              </span>
              <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 capitalize">
                {job.jobType?.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(job._id); }}
            className="btn-ghost p-2 shrink-0"
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary-600" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <span className="font-semibold text-primary-600">{formatSalary(job.salary)}</span>
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDate(job.createdAt)}
        </span>
      </div>
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default JobCard;
