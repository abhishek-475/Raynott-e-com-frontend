import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../services/orderService";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaTruck,
  FaCreditCard,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPrint,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
  FaRupeeSign,
  FaStore
} from "react-icons/fa";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusConfig = (status) => {
    const configs = {
      "pending": { 
        color: "text-yellow-600 bg-yellow-50 border-yellow-200", 
        icon: <FaClock className="h-5 w-5" />,
        text: "Pending"
      },
      "processing": { 
        color: "text-blue-600 bg-blue-50 border-blue-200", 
        icon: <FaClock className="h-5 w-5" />,
        text: "Processing"
      },
      "shipped": { 
        color: "text-purple-600 bg-purple-50 border-purple-200", 
        icon: <FaTruck className="h-5 w-5" />,
        text: "Shipped"
      },
      "delivered": { 
        color: "text-green-600 bg-green-50 border-green-200", 
        icon: <FaCheckCircle className="h-5 w-5" />,
        text: "Delivered"
      },
      "cancelled": { 
        color: "text-red-600 bg-red-50 border-red-200", 
        icon: <FaTimesCircle className="h-5 w-5" />,
        text: "Cancelled"
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const getPaymentStatusConfig = (status) => {
    const configs = {
      "paid": { color: "text-green-600 bg-green-50 border-green-200", text: "Paid" },
      "pending": { color: "text-yellow-600 bg-yellow-50 border-yellow-200", text: "Pending" },
      "failed": { color: "text-red-600 bg-red-50 border-red-200", text: "Failed" }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const steps = [
    { id: 1, title: "Order Placed", icon: <FaShoppingBag /> },
    { id: 2, title: "Processing", icon: <FaClock /> },
    { id: 3, title: "Shipped", icon: <FaTruck /> },
    { id: 4, title: "Delivered", icon: <FaCheckCircle /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading order details...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching your order information</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <FaTimesCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Order Not Found</h2>
          <p className="text-gray-600 mb-8">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaArrowLeft className="h-4 w-4" />
              View All Orders
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaStore className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <FaArrowLeft className="h-4 w-4" />
                  Back to Orders
                </Link>
              </div>
              <h1 className="text-3xl font-bold mb-2">Order Details</h1>
              <div className="flex flex-wrap items-center gap-4">
                <code className="text-blue-100 bg-white/10 px-3 py-1 rounded-lg font-mono">
                  #{order._id.slice(-8).toUpperCase()}
                </code>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span className="font-medium">{statusConfig.text}</span>
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <FaPrint className="h-4 w-4" />
                Print Invoice
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-3 bg-white text-blue-600 hover:bg-white/90 font-medium rounded-lg transition-colors">
                <FaDownload className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Tracking */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaTruck className="h-6 w-6 text-blue-600" />
            Order Tracking
          </h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-green-500 transform -translate-y-1/2 transition-all duration-500"
              style={{ width: `${(steps.findIndex(s => s.title.toLowerCase() === order.status) + 1) * 25}%` }}
            ></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const isActive = index <= steps.findIndex(s => s.title.toLowerCase() === order.status);
                const isCurrent = step.title.toLowerCase() === order.status;
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                      ${isActive 
                        ? 'bg-green-500 text-white shadow-lg transform scale-110' 
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                      }
                      ${isCurrent ? 'ring-4 ring-green-200' : ''}
                    `}>
                      {step.icon}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-green-600 font-medium mt-1 animate-pulse">
                        Current Status
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <FaShoppingBag className="h-6 w-6 text-blue-600" />
                  Order Items ({order.items.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="h-24 w-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                              {item.color && (
                                <span className="flex items-center gap-1">
                                  <div 
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.color}
                                </span>
                              )}
                              {item.size && <span>Size: {item.size}</span>}
                              {item.variant && <span>Variant: {item.variant}</span>}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-700">Quantity: {item.quantity}</span>
                              <span className="text-gray-700">•</span>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getPaymentStatusConfig(item.paymentStatus).color}`}>
                                {item.paymentStatus}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              <FaRupeeSign className="inline h-4 w-4 mr-1" />
                              {(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                            <p className="text-sm text-gray-500">
                              <FaRupeeSign className="inline h-3 w-3 mr-0.5" />
                              {item.product.price.toLocaleString('en-IN')} each
                            </p>
                            {item.product.originalPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                <FaRupeeSign className="inline h-3 w-3 mr-0.5" />
                                {item.product.originalPrice.toLocaleString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Item Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors">
                          Buy Again
                        </button>
                        <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                          Write a Review
                        </button>
                        {order.status === 'delivered' && (
                          <button className="px-4 py-2 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors">
                            Get Support
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Info */}
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaCreditCard className="h-6 w-6 text-blue-600" />
                Order Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    <FaRupeeSign className="inline h-3 w-3 mr-1" />
                    {order.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    <FaRupeeSign className="inline h-3 w-3 mr-1" />
                    {order.shipping.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    <FaRupeeSign className="inline h-3 w-3 mr-1" />
                    {order.tax.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -<FaRupeeSign className="inline h-3 w-3 mr-1" />
                    {(order.discount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">
                      <FaRupeeSign className="inline h-4 w-4 mr-1" />
                      {order.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
                Order Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium flex items-center gap-2">
                    <FaCreditCard className="h-4 w-4 text-gray-400" />
                    {order.paymentMethod || 'Credit Card'}
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${paymentConfig.color}`}>
                      {paymentConfig.text}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                  <p className="font-medium">
                    {order.expectedDelivery 
                      ? new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Within 5-7 business days'}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {order.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FaMapMarkerAlt className="h-6 w-6 text-blue-600" />
                  Shipping Address
                </h2>
                
                <div className="space-y-2">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p className="text-gray-600">{order.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                  <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}