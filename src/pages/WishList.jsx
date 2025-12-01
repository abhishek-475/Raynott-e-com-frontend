import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaTrash, 
  FaEye, 
  FaTag,
  FaFilter,
  FaTimes,
  FaArrowRight,
  FaFire,
  FaStar,
  FaShoppingBag,
  FaChevronRight,
  FaRegHeart,
  FaCheck,
  FaExclamationCircle,
  FaShareAlt
} from "react-icons/fa";

export default function Wishlist() {
  const { 
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist
  } = useContext(WishlistContext);
  
  const { addToCart } = useContext(CartContext);
  
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh wishlist items
  const refreshWishlistData = () => {
    refreshWishlist();
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshWishlistData();
    setLoading(false);
  }, []);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistChange = () => {
      console.log('Wishlist page: Wishlist updated');
    };

    window.addEventListener('wishlist-state-changed', handleWishlistChange);
    
    return () => {
      window.removeEventListener('wishlist-state-changed', handleWishlistChange);
    };
  }, []);

  const handleRemoveItem = (id, name) => {
    const success = removeFromWishlist(id);
    if (success) {
      refreshWishlistData();
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      toast.success(`"${name}" removed from wishlist!`);
    } else {
      toast.error("Failed to remove item from wishlist");
    }
  };

  const handleMoveToCart = (item) => {
    // Remove wishlist-specific properties before adding to cart
    const { addedAt, ...cartItem } = item;
    const cartSuccess = addToCart({
      ...cartItem,
      quantity: 1
    });
    
    if (cartSuccess) {
      const wishlistSuccess = removeFromWishlist(item.id);
      if (wishlistSuccess) {
        refreshWishlistData();
        setSelectedItems(prev => prev.filter(itemId => itemId !== item.id));
        toast.success(`"${item.name}" moved to cart!`);
      }
    } else {
      toast.error("Failed to add item to cart");
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to remove ${selectedItems.length} items from wishlist?`)) {
      let removedCount = 0;
      selectedItems.forEach(id => {
        const success = removeFromWishlist(id);
        if (success) removedCount++;
      });
      refreshWishlistData();
      setSelectedItems([]);
      toast.success(`${removedCount} items removed from wishlist!`);
    }
  };

  const handleMoveSelectedToCart = () => {
    if (selectedItems.length === 0) return;
    
    let movedCount = 0;
    selectedItems.forEach(id => {
      const item = wishlistItems.find(item => item.id === id);
      if (item) {
        const { addedAt, ...cartItem } = item;
        const cartSuccess = addToCart({
          ...cartItem,
          quantity: 1
        });
        
        if (cartSuccess) {
          const wishlistSuccess = removeFromWishlist(id);
          if (wishlistSuccess) movedCount++;
        }
      }
    });
    
    refreshWishlistData();
    setSelectedItems([]);
    toast.success(`${movedCount} items moved to cart!`);
  };

  // Helper functions to calculate additional data
  const getItemStock = (item) => {
    return item.stock || (Math.random() > 0.2 ? Math.floor(Math.random() * 20) + 1 : 0);
  };

  const getItemRating = (item) => {
    return item.rating || (Math.random() * 2 + 3.5).toFixed(1);
  };

  const getItemReviewCount = (item) => {
    return item.reviewCount || Math.floor(Math.random() * 500);
  };

  const getItemCategory = (item) => {
    return item.category || (Math.random() > 0.5 ? "Electronics" : "Fashion");
  };

  const getItemColors = (item) => {
    return item.colors || ["Black", "White", "Blue", "Red"].slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const filters = [
    { id: "all", label: "All Items", count: wishlistItems.length },
    { id: "in-stock", label: "In Stock", count: wishlistItems.filter(item => getItemStock(item) > 0).length },
    { id: "on-sale", label: "On Sale", count: wishlistItems.filter(item => item.originalPrice > item.price).length },
    { id: "electronics", label: "Electronics", count: wishlistItems.filter(item => getItemCategory(item).toLowerCase() === "electronics").length },
    { id: "fashion", label: "Fashion", count: wishlistItems.filter(item => getItemCategory(item).toLowerCase() === "fashion").length }
  ];

  const filteredItems = wishlistItems.filter(item => {
    if (filterBy === "all") return true;
    if (filterBy === "in-stock") return getItemStock(item) > 0;
    if (filterBy === "on-sale") return item.originalPrice > item.price;
    if (filterBy === "electronics") return getItemCategory(item).toLowerCase() === "electronics";
    if (filterBy === "fashion") return getItemCategory(item).toLowerCase() === "fashion";
    return true;
  });

  const calculateTotalValue = () => {
    return filteredItems.reduce((total, item) => total + (item.price || 0), 0);
  };

  const calculateTotalSavings = () => {
    return filteredItems.reduce((total, item) => {
      if (item.originalPrice) {
        return total + (item.originalPrice - item.price);
      }
      return total;
    }, 0);
  };

  const inStockItemsCount = wishlistItems.filter(item => getItemStock(item) > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your wishlist...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching your saved items</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug button - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={refreshWishlistData}
          className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded text-sm z-50 flex items-center gap-2"
        >
          🔄 Refresh Wishlist
        </button>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <FaHeart className="h-10 w-10 text-pink-200" />
                My Wishlist
              </h1>
              <p className="text-pink-100 text-lg">
                Save your favorite items and buy them later
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
                <div className="text-2xl font-bold">{wishlistCount}</div>
                <div className="text-sm text-pink-100">Saved Items</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
                <div className="text-2xl font-bold">₹{calculateTotalValue().toLocaleString('en-IN')}</div>
                <div className="text-sm text-pink-100">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items in Wishlist</p>
                <p className="text-2xl font-bold text-gray-900">{wishlistCount}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-xl">
                <FaHeart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ready to Buy</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inStockItemsCount}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {inStockItemsCount > 0 && (
              <button
                onClick={() => {
                  let movedCount = 0;
                  wishlistItems.forEach(item => {
                    if (getItemStock(item) > 0) {
                      const { addedAt, ...cartItem } = item;
                      const cartSuccess = addToCart({
                        ...cartItem,
                        quantity: 1
                      });
                      
                      if (cartSuccess) {
                        const wishlistSuccess = removeFromWishlist(item.id);
                        if (wishlistSuccess) movedCount++;
                      }
                    }
                  });
                  
                  refreshWishlistData();
                  toast.success(`${movedCount} items moved to cart!`);
                }}
                className="w-full mt-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg transition-colors"
              >
                <FaCheck className="inline h-4 w-4 mr-2" />
                Add All Available to Cart
              </button>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{calculateTotalSavings().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FaTag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter className="h-5 w-5 text-gray-600" />
                  Filter By
                </h2>
                {filterBy !== "all" && (
                  <button
                    onClick={() => setFilterBy("all")}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="space-y-2 mb-8">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterBy(filter.id)}
                    className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      filterBy === filter.id
                        ? 'bg-pink-50 text-pink-700 border border-pink-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        filterBy === filter.id ? 'bg-pink-500' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium">{filter.label}</span>
                    </div>
                    {filter.count !== undefined && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedItems.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Selected ({selectedItems.length})</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleMoveSelectedToCart}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <FaShoppingCart className="h-4 w-4" />
                      Add Selected to Cart
                    </button>
                    <button
                      onClick={handleRemoveSelected}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="h-4 w-4" />
                      Remove Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Wishlist Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-medium">{wishlistCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">In Stock</span>
                    <span className="font-medium text-green-600">{inStockItemsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">On Sale</span>
                    <span className="font-medium text-red-600">
                      {wishlistItems.filter(item => item.originalPrice > item.price).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="lg:col-span-3">
            {/* Header Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Select All ({selectedItems.length}/{wishlistCount})
                    </label>
                  </div>
                  
                  {selectedItems.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleMoveSelectedToCart}
                        className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium rounded-lg transition-colors"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={handleRemoveSelected}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {wishlistCount} items
                </div>
              </div>
            </div>

            {/* Wishlist Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaRegHeart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {filterBy === "all" ? "Your Wishlist is Empty" : "No Items Found"}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filterBy === "all" 
                    ? "Start adding items you love to your wishlist. They'll be saved here for later."
                    : "Try changing your filters to see more items."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700 transition-colors"
                  >
                    <FaShoppingBag className="h-4 w-4" />
                    Start Shopping
                  </Link>
                  {filterBy !== "all" && (
                    <button
                      onClick={() => setFilterBy("all")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaTimes className="h-4 w-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredItems.map((item) => {
                  const stock = getItemStock(item);
                  const rating = getItemRating(item);
                  const reviewCount = getItemReviewCount(item);
                  const category = getItemCategory(item);
                  const colors = getItemColors(item);
                  const isOnSale = item.originalPrice > item.price;
                  
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Checkbox */}
                        <div className="p-6 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>

                        {/* Product Image */}
                        <div className="md:w-1/4 p-6">
                          <Link to={`/product/${item.id}`}>
                            <div className="relative overflow-hidden bg-gray-100 rounded-xl aspect-square">
                              <img
                                src={item.image || "https://via.placeholder.com/400"}
                                alt={item.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                              {isOnSale && (
                                <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                  -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                </span>
                              )}
                            </div>
                          </Link>
                        </div>

                        {/* Product Details */}
                        <div className="md:w-2/4 p-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link to={`/product/${item.id}`}>
                                  <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                    {item.name}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                    {category}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <FaStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-medium">{rating}</span>
                                    <span className="text-sm text-gray-400">({reviewCount})</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-gray-900">
                                  ₹{(item.price || 0).toLocaleString('en-IN')}
                                </span>
                                {isOnSale && (
                                  <span className="text-lg text-gray-500 line-through">
                                    ₹{item.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {colors.slice(0, 3).map((color, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                  >
                                    {color}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                {stock > 0 ? (
                                  <span className="text-green-600 font-medium flex items-center gap-1">
                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    In Stock ({stock})
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium flex items-center gap-1">
                                    <FaExclamationCircle className="h-3 w-3" />
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="md:w-1/4 p-6 border-l border-gray-100">
                          <div className="flex flex-col gap-3 h-full">
                            <button
                              onClick={() => handleMoveToCart(item)}
                              disabled={stock === 0}
                              className={`flex items-center justify-center gap-2 py-3 font-medium rounded-xl transition-all ${
                                stock === 0
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              <FaShoppingCart className="h-4 w-4" />
                              Add to Cart
                            </button>
                            
                            <Link
                              to={`/product/${item.id}`}
                              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-medium rounded-xl transition-colors"
                            >
                              <FaEye className="h-4 w-4" />
                              View Details
                            </Link>
                            
                            <button
                              onClick={() => handleRemoveItem(item.id, item.name)}
                              className="flex items-center justify-center gap-2 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-xl transition-colors"
                            >
                              <FaTrash className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}