import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Briefcase, Sun, Moon, Menu, X, Bell, User, LogOut,
  LayoutDashboard, FileText, Search, MessageSquare, Shield,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { logout } from '../../store/store';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { darkMode, toggleTheme } = useTheme();
  const { unreadCount } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const dashboardLink = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'recruiter'
    ? '/recruiter'
    : '/dashboard';

  const navLinks = [
    { to: '/jobs', label: 'Jobs', icon: Search },
    { to: '/companies', label: 'Companies', icon: Briefcase },
    { to: '/ats', label: 'ATS Checker', icon: FileText },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              JobPortal
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="btn-ghost px-4 py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="btn-ghost p-2 relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 btn-ghost p-1.5 pr-3"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name?.[0]}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 glass-card py-2 shadow-2xl"
                      >
                        <Link to={dashboardLink} onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link to="/messages" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <MessageSquare className="w-4 h-4" /> Messages
                        </Link>
                      {user?.role === "jobseeker" && (
  <Link
    to="/resume-builder"
    onClick={() => setProfileOpen(false)}
    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    <FileText className="w-4 h-4" /> Resume Builder
  </Link>
)}
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm font-medium">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            <button className="md:hidden btn-ghost p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
