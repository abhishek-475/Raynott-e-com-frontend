import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaArrowLeft,
  FaTag,
  FaShieldAlt,
  FaTruck,
  FaCreditCard,
  FaLock,
  FaStore,
  FaHeart,
  FaExclamationCircle
} from "react-icons/fa";

export default function Cart() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    isLoading
  } = useContext(CartContext);

  const { addToWishlist } = useContext(WishlistContext);

  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Refresh cart on mount to ensure latest data
    const initializeCart = async () => {
      await refreshCart();
      setLocalLoading(false);
    };

    initializeCart();

    // Listen for cart updates from other tabs/components
    const handleCartUpdate = () => {
      console.log('Cart page: Cart updated event received');
    };

    window.addEventListener('cart-state-changed', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-state-changed', handleCartUpdate);
    };
  }, [refreshCart]);

  const handleRemove = (id, name) => {
    const success = removeFromCart(id);
    if (success) {
      toast.success(`"${name}" removed from cart!`);
    } else {
      toast.error("Failed to remove item from cart");
    }
  };

  const handleQuantity = (id, qty) => {
    if (qty < 1) {
      const item = cartItems.find(item => item.id === id);
      if (item) {
        handleRemove(id, item.name);
      }
      return;
    }
    if (qty > 10) {
      toast.warning('Maximum 10 items per product');
      return;
    }
    const success = updateQuantity(id, qty);
    if (success) {
      toast.info(`Quantity updated to ${qty}`);
    }
  };

  const handleMoveToWishlist = (item) => {
    // Remove quantity property before adding to wishlist
    const { quantity, cartId, addedAt, ...wishlistItem } = item;
    const wishlistSuccess = addToWishlist(wishlistItem);
    const cartSuccess = removeFromCart(item.id);

    if (wishlistSuccess && cartSuccess) {
      toast.success(`"${item.name}" moved to wishlist!`);
    } else if (wishlistSuccess) {
      toast.success(`"${item.name}" added to wishlist!`);
    } else if (cartSuccess) {
      toast.info(`"${item.name}" removed from cart`);
    }
  };

  const shippingFee = cartTotal > 500 ? 0 : 50;
  const tax = cartTotal * 0.18; // 18% GST
  const grandTotal = cartTotal + shippingFee + tax;

  const savings = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price) * (item.quantity || 1);
    }
    return acc;
  }, 0);

  const checkoutHandler = () => {
    if (cartItems.length === 0) {
      return toast.error("Your cart is empty");
    }
    navigate("/checkout");
  };

  const continueShopping = () => {
    navigate("/");
  };

  const refreshCartData = () => {
    refreshCart();
    toast.info("Cart refreshed!");
  };

  const generateItemKey = (item) => {
    return `${item.id}_${item.cartId || ''}_${item.variant || ''}_${item.size || ''}_${item.color || ''}`;
  };

  if (isLoading || localLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <FaShoppingCart className="h-8 w-8" />
                Shopping Cart
              </h1>
              <p className="text-blue-100">Review and manage your items</p>
            </div>
            <div className="hidden md:block p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{cartCount}</div>
                <div className="text-sm">Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartCount === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaShoppingCart className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start shopping to add products!
                </p>
                <button
                  onClick={continueShopping}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <FaStore className="h-5 w-5" />
                  Start Shopping
                  <FaArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">
                        Cart Items ({cartCount})
                      </h2>
                      <button
                        onClick={() => {
                          if (confirm("Remove all items from cart?")) {
                            const success = clearCart();
                            if (success) {
                              toast.success("All items removed from cart!");
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                      >
                        <FaTrash className="h-4 w-4" />
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <div
                        key={generateItemKey(item)}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="h-32 w-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                <img
                                  src={item.image || "https://via.placeholder.com/200"}
                                  alt={item.name}
                                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              {item.originalPrice && (
                                <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col h-full">
                              <div className="flex-1">
                                <Link to={`/product/${item.id}`}>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                                    {item.name}
                                  </h3>
                                </Link>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                  {item.color && (
                                    <span className="flex items-center gap-1 text-sm text-gray-600">
                                      <div
                                        className="w-3 h-3 rounded-full border border-gray-300"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      {item.color}
                                    </span>
                                  )}
                                  {item.size && (
                                    <span className="text-sm text-gray-600">Size: {item.size}</span>
                                  )}
                                  <span className="text-sm text-green-600 font-medium">In Stock</span>
                                </div>
                              </div>

                              {/* Quantity & Price Controls */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => handleQuantity(item.id, (item.quantity || 1) - 1)}
                                      disabled={(item.quantity || 1) <= 1}
                                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <FaMinus className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <span className="px-6 py-2 font-semibold min-w-[60px] text-center bg-white">
                                      {item.quantity || 1}
                                    </span>
                                    <button
                                      onClick={() => handleQuantity(item.id, (item.quantity || 1) + 1)}
                                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                      <FaPlus className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleMoveToWishlist(item)}
                                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      <FaHeart className="h-4 w-4" />
                                      Save for Later
                                    </button>
                                    <button
                                      onClick={() => handleRemove(item.id, item.name)}
                                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      <FaTrash className="h-4 w-4" />
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                      ₹{((item.price * (item.quantity || 1))).toLocaleString('en-IN')}
                                    </span>
                                    {item.originalPrice && (
                                      <span className="text-sm text-gray-500 line-through">
                                        ₹{((item.originalPrice * (item.quantity || 1))).toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    ₹{item.price.toLocaleString('en-IN')} each
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Shopping Button */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <button
                    onClick={continueShopping}
                    className="w-full flex items-center justify-center gap-3 py-4 text-gray-700 hover:text-gray-900 font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-300 hover:bg-gray-50"
                  >
                    <FaArrowLeft className="h-5 w-5" />
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600 flex items-center gap-2">
                        <FaTag className="h-4 w-4" />
                        Savings
                      </span>
                      <span className="font-medium text-green-600">
                        -₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaTruck className="h-4 w-4" />
                      Shipping
                    </span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shippingFee.toLocaleString('en-IN')}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Grand Total</span>
                      <span className="text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {cartTotal < 500 && cartTotal > 0 && (
                  <div className="pt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">Add ₹{(500 - cartTotal).toFixed(2)} for FREE shipping</span>
                      <span className="font-medium">{Math.round((cartTotal / 500) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((cartTotal / 500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Promo Code */}
                <div className="pt-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={checkoutHandler}
                  disabled={cartCount === 0}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all duration-300 mt-6 ${cartCount === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                    }`}
                >
                  <FaLock className="h-5 w-5" />
                  Proceed to Checkout
                  <FaArrowRight className="h-4 w-4" />
                </button>

                {/* Security Badge */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                    <FaShieldAlt className="h-5 w-5 text-green-500" />
                    <span>Secure checkout powered by SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
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
                    <p className="text-sm text-gray-600">100% safe & encrypted</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FaCreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Cart Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items in cart</span>
                  <span className="font-medium">{cartCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated savings</span>
                  <span className="font-medium text-green-600">₹{savings.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <Link
                    to="/wishlist"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-xl transition-colors"
                  >
                    <FaHeart className="h-4 w-4" />
                    View Wishlist
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}