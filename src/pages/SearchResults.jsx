import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { searchProducts, getCategories } from "../services/productService";
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaTimes,
  FaTag,
  FaFire,
  FaStar,
  FaShoppingBag,
  FaChevronRight,
  FaExclamationCircle,
  FaLayerGroup,
  FaSpinner,
  FaArrowLeft,
  FaCalendarAlt,
  FaShoppingCart,
  FaHeart
} from "react-icons/fa";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [searchInput, setSearchInput] = useState(query);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sortOptions = [
    { id: "relevance", name: "Relevance" },
    { id: "price-low", name: "Price: Low to High" },
    { id: "price-high", name: "Price: High to Low" },
    { id: "rating", name: "Top Rated" },
    { id: "newest", name: "Newest First" }
  ];

  // Load initial data and search results
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (query || category) {
      loadSearchResults();
    } else {
      loadAllProducts();
    }
  }, [query, category]);

  useEffect(() => {
    if (products.length > 0) {
      filterAndSortProducts();
    }
  }, [products, sortBy, priceRange, selectedCategories, ratingFilter]);

  // Load categories and initial data
  const loadInitialData = async () => {
    try {
      const categories = await getCategories();
      setAllCategories(categories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  // Load search results
  const loadSearchResults = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    
    try {
      const params = {
        q: query,
        category: category,
        sort: sortBy,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      };
      
      const data = await searchProducts(params);
      setProducts(Array.isArray(data) ? data : []);
      
      // Initialize selected categories
      if (category) {
        setSelectedCategories([category]);
      }
      
      // Calculate category counts
      calculateCategoryCounts(data);
      
      const endTime = Date.now();
      setSearchTime(endTime - startTime);
      
    } catch (error) {
      console.error("Error loading search results:", error);
      setError("Failed to load search results. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all products when no search query
  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const params = {
        sort: sortBy !== 'relevance' ? sortBy : 'newest'
      };
      const data = await searchProducts(params);
      setProducts(Array.isArray(data) ? data : []);
      calculateCategoryCounts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category counts from products
  const calculateCategoryCounts = (productList) => {
    const counts = {};
    productList.forEach(product => {
      if (product.category) {
        const categoryName = product.category.toLowerCase();
        counts[categoryName] = (counts[categoryName] || 0) + 1;
      }
    });
    setCategoryCounts(counts);
  };

  // Filter and sort products client-side
  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        product.category && selectedCategories.some(cat =>
          product.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product =>
        (product.rating || 0) >= ratingFilter
      );
    }

    // Client-side sorting for additional filtering
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
        // Sort by creation date if available
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  // Handle category selection
  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSortBy("relevance");
    setPriceRange([0, 100000]);
    setSelectedCategories(category ? [category] : []);
    setRatingFilter(0);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  // Generate search suggestions
  const generateSuggestions = () => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const input = searchInput.toLowerCase();
    const baseSuggestions = [
      `${input} pro`,
      `${input} max`,
      `${input} premium`,
      `best ${input}`,
      `${input} 2024`,
      `${input} wireless`,
      `buy ${input}`,
      `${input} price`
    ];

    // Add category suggestions
    const categorySuggestions = allCategories
      .filter(cat => cat.toLowerCase().includes(input))
      .slice(0, 3);

    // Add product name suggestions from current results
    const productSuggestions = products
      .filter(p => p.name.toLowerCase().includes(input))
      .map(p => p.name)
      .slice(0, 3);

    setSuggestions([...new Set([...baseSuggestions, ...categorySuggestions, ...productSuggestions])].slice(0, 8));
  };

  // Calculate price statistics
  const calculatePriceStats = () => {
    if (products.length === 0) return { min: 0, max: 100000 };
    
    const prices = products.map(p => p.price || 0).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 100000 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices, 100000)
    };
  };

  const priceStats = calculatePriceStats();
  const maxPrice = Math.max(priceStats.max, 100000);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            {query ? `Searching for "${query}"` : "Loading products..."}
          </p>
          <p className="text-sm text-gray-500">Finding the best products for you...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <FaExclamationCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadSearchResults}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold">Search Results</h1>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <FaSearch className="h-5 w-5 md:h-6 md:w-6 text-blue-200" />
                <p className="text-lg md:text-xl">
                  {query ? `"${query}"` : "All Products"}
                  {category && ` in ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </p>
              </div>
              <p className="text-blue-100 text-sm md:text-base">
                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} in {searchTime}ms
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-white/10 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 rounded-xl">
                <div className="text-xl md:text-2xl font-bold">{filteredProducts.length}</div>
                <div className="text-xs md:text-sm text-white/80">Results</div>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-8 max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    generateSuggestions();
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search for products, brands, and categories..."
                  className="w-full pl-12 pr-4 py-3 md:py-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-white text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 md:px-6 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-r-xl transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <Link
                        key={index}
                        to={`/search?query=${encodeURIComponent(suggestion)}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <FaSearch className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{suggestion}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaFilter className="h-5 w-5 text-blue-600" />
                  Refine Search
                </h2>
                <div className="flex gap-2">
                  {(selectedCategories.length > 0 || ratingFilter > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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

              {/* Categories */}
              {allCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((cat) => (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`cat-${cat}`}
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`cat-${cat}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                          >
                            {cat}
                          </label>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {categoryCounts[cat.toLowerCase()] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Price Range</h3>
                  <span className="text-sm text-blue-600 font-medium">
                    ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>₹0</span>
                    <span>₹{maxPrice.toLocaleString('en-IN')}+</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        ratingFilter === rating
                          ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <FaStar className={`h-4 w-4 ${ratingFilter === rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Products</span>
                    <span className="font-medium">{products.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Filtered Results</span>
                    <span className="font-medium text-blue-600">{filteredProducts.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price Range</span>
                    <span className="font-medium">
                      ₹{priceStats.min.toLocaleString('en-IN')} - ₹{priceStats.max.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:w-3/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <FaFilter className="h-5 w-5" />
                Show Filters
              </button>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-5 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} 
                    {query ? ` for "${query}"` : ''}
                    {category && ` in ${category}`}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedCategories.length > 0 && `Categories: ${selectedCategories.join(", ")} • `}
                    {ratingFilter > 0 && `Rating: ${ratingFilter}+ stars • `}
                    Price: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <FaSortAmountDown className="h-4 w-4 text-gray-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-w-[180px]"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || ratingFilter > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span key={cat} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                        <FaTag className="h-3 w-3" />
                        {cat}
                        <button 
                          onClick={() => toggleCategory(cat)}
                          className="hover:text-blue-800"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {ratingFilter > 0 && (
                      <span className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm">
                        <FaStar className="h-3 w-3" />
                        {ratingFilter}+ stars
                        <button 
                          onClick={() => setRatingFilter(0)}
                          className="hover:text-yellow-800"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                      <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                        <FaCalendarAlt className="h-3 w-3" />
                        Price Filter
                        <button 
                          onClick={() => setPriceRange([0, maxPrice])}
                          className="hover:text-green-800"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaExclamationCircle className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">No Results Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {query 
                    ? `We couldn't find any products matching "${query}". Try different keywords or adjust your filters.`
                    : "No products found with the current filters. Try adjusting your search criteria."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Search Tips & Info */}
                <div className="mt-10 md:mt-12">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-blue-100">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Search Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FaTag className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Use Specific Terms</h4>
                          <p className="text-sm text-gray-600">Try using specific product names or model numbers for better results</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FaLayerGroup className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Filter by Category</h4>
                          <p className="text-sm text-gray-600">Narrow down results using category filters on the left</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FaStar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Check Ratings</h4>
                          <p className="text-sm text-gray-600">Filter by customer ratings for quality products</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Popular Categories */}
                    {allCategories.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-3">Popular Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {allCategories.slice(0, 8).map((cat) => (
                            <Link
                              key={cat}
                              to={`/search?category=${encodeURIComponent(cat)}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            >
                              <FaShoppingBag className="h-3 w-3" />
                              <span className="text-sm font-medium">{cat}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {filteredProducts.length > 6 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          <FaChevronRight className="h-5 w-5 rotate-270" />
        </button>
      )}
    </div>
  );
}