import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { getProducts } from "../services/productService";
import { 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaFire,
  FaStar,
  FaTag,
  FaChevronRight,
  FaShoppingBag,
  FaTimes,
  FaLayerGroup,
  FaBolt,
  FaPercent,
  FaTruck,
  FaCheck,
  FaHeart,
  FaShoppingCart,
  FaExclamationTriangle,
  FaLaptop,
  FaTshirt,
  FaHome,
  FaBook,
  FaFemale,
  FaFootballBall,
  FaSearch
} from "react-icons/fa";
import { 
  MdPhoneIphone,
  MdKitchen,
  MdSportsBasketball,
  MdLocalGroceryStore
} from "react-icons/md";

export default function Categories() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use contexts
  const { addToCart, isInCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const categories = [
    {
      id: "electronics",
      name: "Electronics",
      description: "Latest gadgets, smartphones, laptops, and tech accessories",
      icon: <FaLaptop className="h-8 w-8" />,
      iconColor: "text-blue-600",
      bannerColor: "from-blue-500 to-cyan-500",
      subcategories: ["Smartphones", "Laptops", "Headphones", "Wearables", "Accessories"]
    },
    {
      id: "fashion",
      name: "Fashion",
      description: "Trendy clothing, footwear, and accessories for all styles",
      icon: <FaTshirt className="h-8 w-8" />,
      iconColor: "text-pink-600",
      bannerColor: "from-pink-500 to-rose-500",
      subcategories: ["Men", "Women", "Kids", "Footwear", "Accessories"]
    },
    {
      id: "home",
      name: "Home & Kitchen",
      description: "Everything for your home, from appliances to decor",
      icon: <FaHome className="h-8 w-8" />,
      iconColor: "text-green-600",
      bannerColor: "from-green-500 to-emerald-500",
      subcategories: ["Kitchen Appliances", "Furniture", "Decor", "Bedding", "Storage"]
    },
    {
      id: "books",
      name: "Books",
      description: "Best-selling books, novels, and educational materials",
      icon: <FaBook className="h-8 w-8" />,
      iconColor: "text-amber-600",
      bannerColor: "from-amber-500 to-orange-500",
      subcategories: ["Fiction", "Non-Fiction", "Academic", "Children", "Biographies"]
    },
    {
      id: "beauty",
      name: "Beauty & Personal Care",
      description: "Skincare, cosmetics, and personal grooming products",
      icon: <FaFemale className="h-8 w-8" />,
      iconColor: "text-purple-600",
      bannerColor: "from-purple-500 to-pink-500",
      subcategories: ["Skincare", "Makeup", "Haircare", "Fragrances", "Wellness"]
    },
    {
      id: "sports",
      name: "Sports & Outdoors",
      description: "Equipment and gear for sports and outdoor activities",
      icon: <FaFootballBall className="h-8 w-8" />,
      iconColor: "text-red-600",
      bannerColor: "from-red-500 to-orange-500",
      subcategories: ["Fitness", "Outdoor Gear", "Team Sports", "Yoga", "Cycling"]
    }
  ];

  const brands = {
    electronics: ["Apple", "Samsung", "Sony", "OnePlus", "Bose", "JBL", "Dell", "HP"],
    fashion: ["Nike", "Adidas", "Levi's", "H&M", "Zara", "Puma", "Ray-Ban"],
    home: ["Philips", "Prestige", "Milton", "Nilkamal", "Havells", "Butterfly"],
    books: ["Penguin", "HarperCollins", "Rupa", "Westland", "Amazon"],
    beauty: ["L'Oreal", "Maybelline", "Nivea", "Dove", "Lakme", "Mamaearth"],
    sports: ["Nike", "Adidas", "Puma", "Cosco", "Decathlon"]
  };

  const currentCategory = categories.find(cat => cat.id === category) || categories[0];

  useEffect(() => {
    loadCategoryProducts();
  }, [category]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, sortBy, priceRange, selectedBrands, ratingFilter, searchQuery]);

  const loadCategoryProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      // Filter products by category if needed, or use all products
      const categoryProducts = data.filter(product => 
        !category || product.category?.toLowerCase().includes(category.toLowerCase())
      );
      
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts);
      
      // Set max price for range
      if (categoryProducts.length > 0) {
        const maxPrice = Math.max(...categoryProducts.map(p => p.price || 0));
        setPriceRange([0, maxPrice || 200000]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.images?.[0] || product.image,
      description: product.description,
      category: product.category,
      quantity: 1
    };

    const success = addToCart(cartItem);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistToggle = (product) => {
    const wishlistItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.images?.[0] || product.image,
      description: product.description,
      category: product.category
    };

    if (isInWishlist(wishlistItem.id)) {
      const success = removeFromWishlist(wishlistItem.id);
      if (success) {
        toast.info(`${product.name} removed from wishlist`);
      }
    } else {
      const success = addToWishlist(wishlistItem);
      if (success) {
        toast.success(`${product.name} added to wishlist!`);
      }
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand)
      );
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product =>
        (product.rating || 0) >= ratingFilter
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        // Sort by date or isNew flag
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Featured - bestsellers first
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    }

    setFilteredProducts(filtered);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSortBy("featured");
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.price || 0));
      setPriceRange([0, maxPrice || 200000]);
    }
    setSelectedBrands([]);
    setRatingFilter(0);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading {currentCategory.name} products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className={`bg-gradient-to-r ${currentCategory.bannerColor} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-white/20 backdrop-blur-sm rounded-xl ${currentCategory.iconColor}`}>
                  {currentCategory.icon}
                </div>
                <h1 className="text-4xl font-bold">{currentCategory.name}</h1>
              </div>
              <p className="text-white/90 text-lg max-w-2xl">
                {currentCategory.description}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {currentCategory.subcategories.map((subcat, index) => (
                  <Link
                    key={index}
                    to={`/search?category=${currentCategory.id}&query=${subcat}`}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    {subcat}
                    <FaChevronRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-white/80">Products</div>
              </div>
              {products.length > 0 && (
                <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
                  <div className="text-2xl font-bold">From ₹{Math.min(...products.map(p => p.price || 0)).toLocaleString('en-IN')}</div>
                  <div className="text-sm text-white/80">Starting Price</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter className="h-5 w-5 text-blue-600" />
                  Filters
                </h2>
                <div className="flex gap-2">
                  {(selectedBrands.length > 0 || ratingFilter > 0 || searchQuery.trim()) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search within category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search in {currentCategory.name}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Price Range */}
              {products.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(...products.map(p => p.price || 0))}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹0</span>
                      <span>₹{Math.max(...products.map(p => p.price || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Brands */}
              {brands[currentCategory.id] && brands[currentCategory.id].length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Brands</h3>
                  <div className="space-y-2">
                    {brands[currentCategory.id]?.map((brand) => (
                      <div key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`brand-${brand}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                        ratingFilter === rating
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <FaStar className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Navigation */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Browse Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        category === cat.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${cat.iconColor} bg-opacity-10`}>
                        {cat.icon}
                      </div>
                      <span>{cat.name}</span>
                      <FaChevronRight className="h-3 w-3 ml-auto" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                <FaFilter className="h-5 w-5" />
                Show Filters
              </button>
            </div>

            {/* Header Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {filteredProducts.length} Products in {currentCategory.name}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {searchQuery.trim() && `Search: "${searchQuery}" • `}
                    {selectedBrands.length > 0 && `Brands: ${selectedBrands.join(", ")} • `}
                    {ratingFilter > 0 && `Rating: ${ratingFilter}+ stars`}
                  </p>
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaSortAmountDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedBrands.length > 0 || ratingFilter > 0 || searchQuery.trim()) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {searchQuery.trim() && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                        <FaSearch className="h-3 w-3" />
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery("")}>
                          <FaTimes className="h-3 w-3 ml-1" />
                        </button>
                      </span>
                    )}
                    {selectedBrands.map((brand) => (
                      <span key={brand} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                        Brand: {brand}
                        <button onClick={() => toggleBrand(brand)}>
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {ratingFilter > 0 && (
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm">
                        <FaStar className="h-3 w-3" />
                        Rating: {ratingFilter}+ stars
                        <button onClick={() => setRatingFilter(0)}>
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaLayerGroup className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-8">
                  {searchQuery.trim() 
                    ? `No products found for "${searchQuery}" in ${currentCategory.name}`
                    : "Try adjusting your filters to find what you're looking for."
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const productId = product._id || product.id;
                  const isInCartItem = isInCart(productId);
                  const isInWishlistItem = isInWishlist(productId);
                  
                  return (
                    <div
                      key={productId}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2"
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden bg-gray-100">
                        <Link to={`/product/${productId}`}>
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                            alt={product.name}
                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </Link>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </div>
                        )}
                        {product.bestseller && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                            <FaFire className="h-3 w-3" />
                            Bestseller
                          </div>
                        )}
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={() => handleWishlistToggle(product)}
                          className={`absolute top-16 right-4 p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                            isInWishlistItem 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                          aria-label={isInWishlistItem ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <FaHeart className={`h-5 w-5 ${isInWishlistItem ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {product.category || currentCategory.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <FaStar className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium">{product.rating || 4.5}</span>
                          </div>
                        </div>
                        
                        <Link to={`/product/${productId}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-gray-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isInCartItem || !product.inStock}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                              isInCartItem
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : product.inStock
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isInCartItem ? (
                              <>
                                <FaCheck className="h-4 w-4" />
                                Added
                              </>
                            ) : product.inStock ? (
                              <>
                                <FaShoppingCart className="h-4 w-4" />
                                Add to Cart
                              </>
                            ) : (
                              'Out of Stock'
                            )}
                          </button>
                          
                          <Link
                            to={`/product/${productId}`}
                            className="px-4 flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                          >
                            <FaChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Category Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaTruck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Free Shipping</h3>
                </div>
                <p className="text-gray-600">Free delivery on all orders above ₹500</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaBolt className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Fast Delivery</h3>
                </div>
                <p className="text-gray-600">Same-day delivery in major cities</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaPercent className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Best Prices</h3>
                </div>
                <p className="text-gray-600">Price match guarantee on all products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}