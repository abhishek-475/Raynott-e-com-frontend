import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { 
  FaUser, 
  FaShoppingCart, 
  FaHeart, 
  FaSearch, 
  FaChevronDown,
  FaStore,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShoppingBag
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, refreshCart } = useContext(CartContext);
  const { wishlistCount, refreshWishlist } = useContext(WishlistContext);
  
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayUser, setDisplayUser] = useState(user);

  // Listen for user changes
  useEffect(() => {
    setDisplayUser(user);
  }, [user]);

  // Listen for cart/wishlist changes
  useEffect(() => {
    const handleCartChange = () => {
      console.log('Navbar: Cart state changed');
    };

    const handleWishlistChange = () => {
      console.log('Navbar: Wishlist state changed');
    };

    window.addEventListener('cart-state-changed', handleCartChange);
    window.addEventListener('wishlist-state-changed', handleWishlistChange);
    
    return () => {
      window.removeEventListener('cart-state-changed', handleCartChange);
      window.removeEventListener('wishlist-state-changed', handleWishlistChange);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    setDisplayUser(null);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  return (
    <>
   

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <FaStore className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Raynott E-Com
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, and categories..."
                    className="w-full px-4 py-2 pl-12 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="hidden md:flex flex-col items-center text-gray-700 hover:text-purple-600 transition-colors relative"
              >
                <FaHeart className="h-5 w-5" />
                <span className="text-xs mt-1">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="hidden md:flex flex-col items-center text-gray-700 hover:text-purple-600 transition-colors relative"
              >
                <FaShoppingCart className="h-5 w-5" />
                <span className="text-xs mt-1">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Actions */}
              {displayUser ? (
                <div className="relative user-dropdown-container">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {displayUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:inline font-medium">{displayUser.name}</span>
                    <FaChevronDown className={`h-3 w-3 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{displayUser.name}</p>
                        <p className="text-sm text-gray-500">{displayUser.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FaUser className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      
                      <Link
                        to="/my-orders"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FaShoppingBag className="h-4 w-4 mr-3" />
                        My Orders
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FaHeart className="h-4 w-4 mr-3" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      
                      {displayUser.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <FaCog className="h-4 w-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-gray-50 hover:text-red-700 transition-colors"
                      >
                        <FaSignOutAlt className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 focus:outline-none"
              >
                {isMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            {/* Mobile Search */}
            <div className="px-4 py-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 px-4 py-3">
              {displayUser ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {displayUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{displayUser.name}</p>
                      <p className="text-sm text-gray-500">{displayUser.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <Link
                      to="/profile"
                      className="flex items-center py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="h-4 w-4 mr-3" />
                      My Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      className="flex items-center py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaShoppingBag className="h-4 w-4 mr-3" />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center py-2 text-gray-700 hover:text-purple-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHeart className="h-4 w-4 mr-3" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    {displayUser.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center py-2 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaCog className="h-4 w-4 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Shopping Links */}
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  className="flex flex-col items-center justify-center py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHeart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs mt-1 font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute top-2 right-6 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="flex flex-col items-center justify-center py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaShoppingCart className="h-5 w-5 text-gray-600" />
                  <span className="text-xs mt-1 font-medium">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-2 right-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}