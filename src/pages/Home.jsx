import { useEffect, useState, useContext } from "react";
import { getProducts } from "../services/productService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { 
  FaArrowRight, 
  FaTruck, 
  FaShieldAlt, 
  FaCreditCard, 
  FaHeadphones,
  FaStar,
  FaFire,
  FaTag,
  FaShoppingBag,
  FaCrown,
  FaHeart,
  FaShoppingCart,
  FaCheck
} from "react-icons/fa";
import { MdElectricalServices, MdLocalOffer } from "react-icons/md";
import { GiClothes } from "react-icons/gi";
import { BsBook } from "react-icons/bs";
import { AiOutlineRocket } from "react-icons/ai";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Use contexts
  const { addToCart, isInCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.slice(0, 6));
    } catch (error) {
      console.log("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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

  const categories = [
    { 
      name: "Electronics", 
      icon: <MdElectricalServices className="h-10 w-10" />,
      color: "from-blue-500 to-cyan-500",
      count: 45
    },
    { 
      name: "Fashion", 
      icon: <GiClothes className="h-10 w-10" />,
      color: "from-pink-500 to-rose-500",
      count: 78
    },
    { 
      name: "Books", 
      icon: <BsBook className="h-10 w-10" />,
      color: "from-amber-500 to-orange-500",
      count: 32
    },
    { 
      name: "Accessories", 
      icon: <FaShoppingBag className="h-10 w-10" />,
      color: "from-purple-500 to-indigo-500",
      count: 56
    }
  ];

  const features = [
    { 
      icon: <FaTruck className="h-8 w-8" />, 
      title: "Free Shipping", 
      desc: "On orders over ₹500" 
    },
    { 
      icon: <FaShieldAlt className="h-8 w-8" />, 
      title: "Secure Payment", 
      desc: "100% secure transactions" 
    },
    { 
      icon: <FaHeadphones className="h-8 w-8" />, 
      title: "24/7 Support", 
      desc: "Dedicated customer service" 
    },
    { 
      icon: <FaCreditCard className="h-8 w-8" />, 
      title: "Easy Returns", 
      desc: "30-day return policy" 
    }
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 text-white py-24 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <FaFire className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium">Limited Time Offer</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Discover Amazing
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Products
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Shop premium quality products with exclusive deals, fast shipping, and exceptional customer service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
                >
                  <FaShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Shopping
                  <FaArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                </Link>
                
              </div>
            </div>
            
            {/* Hero Image/Graphic */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-30"></div>
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl mb-3"></div>
                        <div className="h-4 bg-white/20 rounded-full mb-2"></div>
                        <div className="h-3 bg-white/10 rounded-full w-2/3"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 group-hover:scale-110 transition-transform duration-300 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Browse through our curated collections to find exactly what you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/category/${category.name.toLowerCase()}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <div className="p-8 relative z-10">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${category.color} text-white mb-6`}>
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.count} products</p>
                  <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    <span>Shop Now</span>
                    <FaArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full mb-3">
                <FaCrown className="h-4 w-4" />
                <span className="text-sm font-medium">Featured Collection</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Trending Products</h2>
              <p className="text-gray-600 mt-2">Discover our most popular items this week</p>
            </div>
            <Link
              to="/products"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg group"
            >
              View All Products
              <FaArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FaShoppingBag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Products Available</h3>
              <p className="text-gray-600">Check back soon for amazing products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
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
                          src={product.images?.[0] || "https://via.placeholder.com/400"}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </Link>
                      {product.originalPrice && (
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
                          {product.category}
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
                        <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && (
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
                          <FaArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
              <FaTag className="h-5 w-5" />
              <span className="font-medium">Limited Time Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get <span className="text-yellow-300">20% OFF</span> on Your First Purchase!
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Sign up today and unlock exclusive deals, early access to sales, and personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                <AiOutlineRocket className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Create Free Account
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
              >
                <FaShoppingBag className="h-5 w-5" />
                Shop Collection
              </Link>
            </div>
            <p className="text-sm text-white/80 mt-8">
              Use code: <span className="font-bold text-yellow-300">WELCOME20</span> at checkout
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}