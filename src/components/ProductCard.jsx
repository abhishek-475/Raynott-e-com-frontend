import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaStar, 
  FaRegStar, 
  FaShoppingCart, 
  FaHeart, 
  FaEye,
  FaShippingFast,
  FaFire
} from 'react-icons/fa';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Get wishlist functions from AuthContext
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    addToCart 
  } = useContext(AuthContext);

  // Check if product is in wishlist
  const isWishlisted = isInWishlist ? isInWishlist(product._id) : false;

  // Calculate discount if originalPrice exists
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate star rating (if not provided, use a default)
  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 128;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FaRegStar className="text-gray-300" />
            <FaStar className="text-yellow-400 fill-yellow-400 absolute inset-0 w-1/2 overflow-hidden" />
          </div>
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prepare product data for cart
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    };
    
    addToCart(cartItem);
    console.log('Added to cart:', product._id);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!addToWishlist || !removeFromWishlist) {
      console.error('Wishlist functions not available');
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(product._id);
      console.log('Removed from wishlist:', product._id);
    } else {
      // Prepare product data for wishlist
      const wishlistItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        rating: product.rating
      };
      
      addToWishlist(wishlistItem);
      console.log('Added to wishlist:', product._id);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              -{discountPercentage}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              NEW
            </span>
          )}
          {product.bestseller && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <FaFire className="text-xs" /> Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-200"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart 
            className={`h-5 w-5 transition-colors ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
            title="Add to cart"
          >
            <FaShoppingCart className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleQuickView}
            className="p-3 bg-white rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
            title="Quick view"
          >
            <FaEye className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Product Image */}
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {product.category || 'Electronics'}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FaShippingFast className="h-3 w-3" />
            Free Shipping
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {renderStars(rating)}
          </div>
          <span className="text-sm text-gray-600">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Quick Add to Cart - Mobile */}
          <button
            onClick={handleAddToCart}
            className="md:hidden p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <FaShoppingCart className="h-5 w-5" />
          </button>
        </div>

        {/* Stock Status */}
        {product.stock && product.stock < 10 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Only {product.stock} left</span>
              <span className="text-red-600 font-medium">Hurry!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(product.stock / 50) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Color Options */}
        {product.colors && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Available Colors:</p>
            <div className="flex gap-2">
              {product.colors.slice(0, 4).map((color, index) => (
                <div
                  key={index}
                  className="h-5 w-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-gray-400">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}