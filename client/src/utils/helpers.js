export const formatSalary = (salary) => {
  if (!salary?.min && !salary?.max) return 'Competitive';

  // Always use Indian Rupee
  const currency = '₹';

  const period =
    salary.period === 'yearly'
      ? '/yr'
      : salary.period === 'monthly'
      ? '/mo'
      : '/hr';

  if (salary.min && salary.max) {
    return `${currency}${salary.min.toLocaleString('en-IN')} - ${currency}${salary.max.toLocaleString('en-IN')}${period}`;
  }

  return `${currency}${(salary.min || salary.max).toLocaleString('en-IN')}${period}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    viewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    shortlisted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    interview_scheduled: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    selected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    closed: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const APPLICATION_STAGES = [
  'applied', 'viewed', 'shortlisted', 'interview_scheduled', 'selected', 'rejected',
];

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
export const WORK_MODES = ['remote', 'hybrid', 'onsite'];
export const RESUME_TEMPLATES = ['modern', 'classic', 'minimal', 'professional', 'creative'];
