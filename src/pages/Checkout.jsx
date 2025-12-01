import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { PaymentContext } from "../context/PaymentContext";
import {
  FaLock,
  FaCreditCard,
  FaMoneyBillWave,
  FaTruck,
  FaHome,
  FaCheckCircle,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCity,
  FaEnvelope,
  FaShoppingBag,
  FaShieldAlt,
  FaArrowLeft,
  FaTag,
  FaBox,
  FaImage
} from "react-icons/fa";

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, cartCount, clearCart } = useContext(CartContext);
  const { 
    paymentLoading, 
    paymentMethod, 
    setPaymentMethod, 
    processPayment 
  } = useContext(PaymentContext);
  
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

  // Form states
  const [address, setAddress] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  // Calculate totals - COD charges for ALL orders
  const shippingFee = cartTotal > 500 ? 0 : 50;
  const tax = cartTotal * 0.18; // 18% GST
  const codCharges = paymentMethod === 'cod' ? 50 : 0; // ₹50 COD charges for ALL orders
  const grandTotal = cartTotal + shippingFee + tax + codCharges;

  // Placeholder image URL that works with HTTPS
  const getPlaceholderImage = (itemName) => {
    const base64Placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg==";
    return base64Placeholder;
  };

  const handleImageError = (e, itemName) => {
    e.target.src = getPlaceholderImage(itemName);
    e.target.onerror = null; // Prevent infinite loop
  };

  useEffect(() => {
    if (cartCount === 0 && !orderPlaced) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }, [cartCount, navigate, orderPlaced]);

  // Pre-fill user data on mount
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    const { name, email, phone, street, city, state, pincode } = address;
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!phone.trim() || phone.length < 10 || !/^\d+$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!street.trim()) {
      toast.error("Please enter your street address");
      return false;
    }
    if (!city.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    if (!state.trim()) {
      toast.error("Please enter your state");
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }
    
    return true;
  };

  const handleAddressSubmit = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  const handlePaymentSubmit = async () => {
    // NO COD validation - COD available for ALL orders
    setLoading(true);
    
    // Calculate subtotal WITHOUT COD charges for backend
    const subtotal = cartTotal;
    const shipping = shippingFee;
    const taxAmount = tax;
    const codCharges = paymentMethod === 'cod' ? 50 : 0;
    
    // Grand total WITH COD charges
    const grandTotalWithCOD = subtotal + shipping + taxAmount + codCharges;
    
    console.log('Payment Data:', {
      subtotal,
      shipping,
      taxAmount,
      codCharges,
      grandTotalWithCOD,
      paymentMethod
    });

    // Prepare order details - Match backend expected structure
    const orderDetails = {
      items: cartItems.map(item => ({
        id: item.id || item._id,
        productId: item.productId || item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        image: item.image
      })),
      subtotal: subtotal,           // Send subtotal (without COD)
      shipping: shipping,           // Send shipping fee
      tax: taxAmount,              // Send tax amount
      grandTotal: grandTotalWithCOD, // Send grand total WITH COD charges
      paymentMethod: paymentMethod
    };

    // Prepare shipping address
    const shippingAddress = {
      name: address.name,
      email: address.email,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country
    };

    console.log('Sending to backend:', {
      orderDetails,
      shippingAddress
    });

    try {
      const success = await processPayment(orderDetails, shippingAddress, (response) => {
        setOrderId(response.orderId || response.order_id || `ORD_${Date.now()}`);
        setOrderNumber(response.orderNumber || response.order_id);
        setOrderPlaced(true);
        setStep(3);
      });

      if (!success) {
        toast.error("Payment processing failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "An error occurred during payment");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/my-orders/${orderId}`);
    } else {
      navigate("/my-orders");
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  if (cartCount === 0 && !orderPlaced) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Steps */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={`step-${stepNumber}`} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step === stepNumber
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : step > stepNumber
                    ? 'bg-green-500 text-white border-2 border-green-500'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}>
                  {step > stepNumber ? (
                    <FaCheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-bold">{stepNumber}</span>
                  )}
                </div>
                <div className={`ml-2 font-medium ${
                  step >= stepNumber ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {stepNumber === 1 ? 'Address' : stepNumber === 2 ? 'Payment' : 'Confirmation'}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step > stepNumber ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form/Info */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaUser className="h-6 w-6 text-blue-600" />
                    Delivery Address
                  </h2>
                  <button
                    onClick={handleBackToCart}
                    className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                    Back to Cart
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={address.email}
                          onChange={handleAddressChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        rows="3"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="House no., Building, Street, Area"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <div className="relative">
                        <FaCity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="State"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        maxLength="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="6-digit pincode"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleAddressSubmit}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <FaCreditCard className="h-6 w-6 text-blue-600" />
                    Select Payment Method
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                    Edit Address
                  </button>
                </div>

                {/* Payment Options */}
                <div className="space-y-4 mb-8">
                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          paymentMethod === 'razorpay' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <FaCreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Credit/Debit Card, UPI & Net Banking</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay securely with Razorpay</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <FaLock className="h-3 w-3" />
                            <span>256-bit SSL secured</span>
                          </div>
                        </div>
                      </div>
                      {paymentMethod === 'razorpay' && (
                        <FaCheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* COD Option - AVAILABLE FOR ALL ORDERS */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          paymentMethod === 'cod' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Cash on Delivery (COD)</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                          <div className="mt-2 text-xs text-gray-600">
                            <p>• ₹50 COD charge will be applied</p>
                            <p>• Available for ALL orders</p>
                          </div>
                        </div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <FaCheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address Summary */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaHome className="h-5 w-5 text-gray-600" />
                    Delivery Address
                  </h3>
                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm">{address.street}</p>
                    <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
                    <p className="text-sm">{address.country}</p>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-sm">📱 {address.phone}</p>
                      <p className="text-sm">✉️ {address.email}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Button - NO COD RESTRICTION */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={loading || paymentLoading}
                  className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-[0.99] ${
                    loading || paymentLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : paymentMethod === 'razorpay'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {loading || paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <FaLock className="h-5 w-5" />
                      Pay ₹{grandTotal.toLocaleString('en-IN')} Securely
                    </>
                  ) : (
                    <>
                      <FaShoppingBag className="h-5 w-5" />
                      Place COD Order (₹{grandTotal.toLocaleString('en-IN')})
                    </>
                  )}
                </button>

                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaShieldAlt className="h-4 w-4 text-green-500" />
                    <span>Your payment is secure and encrypted</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && orderPlaced && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <FaCheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thank you for your purchase. Your order has been successfully placed and is being processed.
                </p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto border border-gray-200">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-500 mb-1">Order Number</div>
                    <div className="text-xl font-bold text-gray-900">{orderNumber}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Payment Method</div>
                      <div className="font-medium text-gray-900 flex items-center justify-center gap-2">
                        {paymentMethod === 'razorpay' ? (
                          <>
                            <FaCreditCard className="h-4 w-4" />
                            Online Payment
                          </>
                        ) : (
                          <>
                            <FaMoneyBillWave className="h-4 w-4" />
                            Cash on Delivery
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="font-bold text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Shipping to:</span> {address.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleViewOrder}
                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaBox className="h-4 w-4" />
                    View Order Details
                  </button>
                  <button
                    onClick={handleContinueShopping}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShoppingBag className="h-4 w-4" />
                    Continue Shopping
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    A confirmation email has been sent to <span className="font-medium">{address.email}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    For any queries, please contact support@raynott.com
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.slice(0, 3).map((item, index) => (
                  <div key={`${item.id}_${index}`} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, item.name)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <FaImage className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-sm">{item.name}</h4>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Qty: {item.quantity || 1}</span>
                        <span className="font-medium">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p className="text-center text-sm text-gray-600">
                    + {cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FaTruck className="h-4 w-4 text-gray-400" />
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

                {/* Always show COD charges when COD is selected */}
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">COD Charges</span>
                    <span className="font-medium text-red-600">+₹50</span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span className="text-blue-600">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      Includes ₹50 COD charges
                    </p>
                  )}
                </div>
              </div>

              {cartTotal < 500 && cartTotal > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
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
            </div>

            {/* Security Badge */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FaLock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Secure Payment</p>
                    <p className="text-sm text-gray-600">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FaShieldAlt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">100% Safe</p>
                    <p className="text-sm text-gray-600">Your data is protected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FaTruck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Easy Returns</p>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}