import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MapPin, Users } from 'lucide-react';

const CompanyCard = ({ company, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Link to={`/companies/${company._id}`} className="glass-card block group hover:border-primary-300 dark:hover:border-primary-700">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {company.logo ? (
            <img src={company.logo} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            company.name?.[0]
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors truncate">
            {company.name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {company.location || 'Remote'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium">{company.averageRating?.toFixed(1) || 'New'}</span>
          <span className="text-gray-400 text-sm">({company.totalReviews || 0})</span>
        </div>
        {company.employeeCount && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Users className="w-4 h-4" />
            {company.employeeCount}
          </span>
        )}
      </div>
    </Link>
  </motion.div>
);

export default CompanyCard;
