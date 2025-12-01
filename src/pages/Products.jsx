import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import { 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaSearch, 
  FaTimes,
  FaTruck,
  FaShieldAlt,
  FaTags,
  FaFire,
  FaStar,
  FaShoppingBag,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  
  const productsPerPage = 12;

  const categories = [
    { id: "all", name: "All Categories", count: 0 },
    { id: "electronics", name: "Electronics", count: 45 },
    { id: "fashion", name: "Fashion", count: 78 },
    { id: "home", name: "Home & Kitchen", count: 56 },
    { id: "books", name: "Books", count: 32 },
    { id: "beauty", name: "Beauty", count: 41 },
    { id: "sports", name: "Sports", count: 28 }
  ];

  const brands = [
    "Apple", "Samsung", "Nike", "Adidas", "Sony", "Philips", 
    "KitchenAid", "Levi's", "Ray-Ban", "Dyson", "Kindle", "Milton"
  ];

  const sortOptions = [
    { id: "featured", name: "Featured", icon: <FaFire /> },
    { id: "price-low", name: "Price: Low to High", icon: <FaSortAmountDown /> },
    { id: "price-high", name: "Price: High to Low", icon: <FaSortAmountUp /> },
    { id: "rating", name: "Top Rated", icon: <FaStar /> },
    { id: "newest", name: "Newest First" }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, selectedCategory, priceRange, selectedBrands, ratingFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
      
      // Calculate max price for price range
      const maxPrice = Math.max(...data.map(p => p.price));
      setPriceRange([0, maxPrice]);
      
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.some(brand =>
          product.name.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product =>
        (product.rating || 4) >= ratingFilter
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 4) - (a.rating || 4));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        // Featured - maintain original order with bestsellers first
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("featured");
    setPriceRange([0, Math.max(...products.map(p => p.price))]);
    setSelectedBrands([]);
    setRatingFilter(0);
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading products...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching the best products for you</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">Our Products</h1>
              <p className="text-blue-100 text-lg">
                Discover {filteredProducts.length}+ premium products for every need
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="text-2xl font-bold">{filteredProducts.length}</div>
                <div className="text-sm text-blue-100">Products</div>
              </div>
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
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range: ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...products.map(p => p.price))}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span>₹{Math.max(...products.map(p => p.price)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {category.count || products.filter(p => p.category.toLowerCase() === category.id).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
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

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h3>
                <div className="flex items-center gap-2">
                  {[4, 3, 2, 1, 0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
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

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FaTruck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Free Shipping</p>
                      <p className="text-xs text-gray-600">On orders over ₹500</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FaShieldAlt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Secure Payment</p>
                      <p className="text-xs text-gray-600">100% safe & encrypted</p>
                    </div>
                  </div>
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
                    Showing {currentProducts.length} of {filteredProducts.length} products
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {selectedCategory !== "all" && `Category: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} • `}
                    {selectedBrands.length > 0 && `Brands: ${selectedBrands.join(", ")} • `}
                    {ratingFilter > 0 && `Rating: ${ratingFilter}+ stars`}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FaSortAmountDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-gray-100 text-gray-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory !== "all" || selectedBrands.length > 0 || ratingFilter > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm("")}>
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategory !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory("all")}>
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedBrands.map((brand) => (
                      <span key={brand} className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                        Brand: {brand}
                        <button onClick={() => toggleBrand(brand)}>
                          <FaTimes className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {ratingFilter > 0 && (
                      <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm">
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
            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-8">
                  Try adjusting your search or filter to find what you're looking for.
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FaChevronLeft className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === number
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <FaChevronRight className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Promotional Banner */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                    <FaTags className="h-4 w-4" />
                    Special Offer
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Get 10% Off Your First Order!
                  </h3>
                  <p className="text-gray-600">
                    Sign up today and get exclusive discounts on your favorite products.
                  </p>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}