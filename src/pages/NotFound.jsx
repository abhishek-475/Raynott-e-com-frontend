import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full mb-6">
            <FaExclamationTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 text-lg mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Let's get you back on track</h3>
            <p className="text-gray-600 text-sm mb-4">
              Return to our homepage and continue shopping
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaHome className="h-4 w-4" />
              Go to Homepage
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Search for products</h3>
            <p className="text-gray-600 text-sm mb-4">
              Use our search to find what you're looking for
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <FaSearch className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>If you believe this is an error, please <Link to="/contact" className="text-blue-600 hover:underline">contact support</Link></p>
        </div>
      </div>
    </div>
  );
}