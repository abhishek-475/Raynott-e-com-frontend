import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import { toast } from "react-toastify";
import { 
  FaShoppingCart, 
  FaHeart, 
  FaShareAlt, 
  FaStar, 
  FaRegStar,
  FaTruck,
  FaShieldAlt,
  FaArrowLeft,
  FaCheck,
  FaPlus,
  FaMinus
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const exist = cart.find((item) => item._id === product._id);

    if (exist) {
      exist.qty += qty;
    } else {
      cart.push({ ...product, qty });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("🎉 Item added to cart successfully!");
  };

  const incrementQty = () => {
    if (qty < product.stock) {
      setQty(qty + 1);
    }
  };

  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/category/${product.category}`} className="hover:text-blue-600 transition-colors capitalize">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Images Section */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={product.images?.[selectedImage] || "https://via.placeholder.com/600"}
                  alt={product.name}
                  className="w-full h-[400px] object-contain transition-transform duration-300 hover:scale-105"
                />
                {discountPercentage > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    -{discountPercentage}% OFF
                  </span>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <span className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    Only {product.stock} left
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images?.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Gallery</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        selectedImage === i 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Product view ${i + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Product Header */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(product.rating || 4.5)}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {product.rating?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    {product.reviewCount || 128} Reviews
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-600 font-medium">
                    {product.sold || 245} Sold
                  </span>
                </div>

                {/* Price Section */}
                <div className="py-4 border-y border-gray-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="ml-2 text-green-600 font-bold">
                          Save ₹{(product.originalPrice - product.price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
                </div>

                {/* Stock Status */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  <FaCheck className="h-4 w-4" />
                  <span className="font-medium">
                    {product.stock > 0 
                      ? `In Stock (${product.stock} available)` 
                      : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={decrementQty}
                      disabled={qty <= 1}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold min-w-[60px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={incrementQty}
                      disabled={qty >= product.stock}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-gray-600">
                    Max: {product.stock} units
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className={`group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    product.stock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  <FaShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 font-medium transition-all duration-300 ${
                      isWishlisted
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <FaHeart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                    Wishlist
                  </button>
                  
                  
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FaTruck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Free Shipping</p>
                      <p className="text-sm text-gray-600">On orders over ₹500</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FaShieldAlt className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Secure Payment</p>
                      <p className="text-sm text-gray-600">100% secure & safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium capitalize">{product.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Brand</p>
                    <p className="font-medium">{product.brand || "Raynott"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {product.specifications && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Specifications</p>
                    <div className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex border-b border-gray-100 py-2">
                          <span className="w-1/3 text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="w-2/3 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}