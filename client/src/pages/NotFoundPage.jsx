import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-8xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">404</h1>
    <p className="text-xl text-gray-500 mt-4 mb-8">Page not found</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage;
