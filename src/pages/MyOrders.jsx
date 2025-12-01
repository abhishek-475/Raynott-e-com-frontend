import { useEffect, useState } from "react";
import { getMyOrders } from "../services/orderService";
import { 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaBoxOpen,
  FaShoppingBag,
  FaRupeeSign,
  FaChevronRight,
  FaEye,
  FaDownload,
  FaRedo
} from "react-icons/fa";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case "delivered": return <FaCheckCircle className="h-5 w-5" />;
      case "shipped": return <FaTruck className="h-5 w-5" />;
      case "processing": return <FaClock className="h-5 w-5" />;
      case "cancelled": return <FaTimesCircle className="h-5 w-5" />;
      default: return <FaBoxOpen className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "delivered": return "bg-green-50 border-green-200 text-green-700";
      case "shipped": return "bg-blue-50 border-blue-200 text-blue-700";
      case "processing": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "cancelled": return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "delivered": return "Delivered";
      case "shipped": return "Shipped";
      case "processing": return "Processing";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const filters = [
    { id: "all", label: "All Orders", count: orders.length },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" }
  ];

  const filteredOrders = selectedFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading your orders...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your order history</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-blue-100">Track and manage all your orders in one place</p>
            </div>
            <div className="hidden md:block p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <FaShoppingBag className="h-12 w-12 text-white/80" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.id === "all" && <FaBoxOpen className="h-4 w-4" />}
                {filter.id === "processing" && <FaClock className="h-4 w-4" />}
                {filter.id === "shipped" && <FaTruck className="h-4 w-4" />}
                {filter.id === "delivered" && <FaCheckCircle className="h-4 w-4" />}
                {filter.id === "cancelled" && <FaTimesCircle className="h-4 w-4" />}
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FaBoxOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Orders Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {selectedFilter === "all" 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                : `You don't have any ${selectedFilter} orders.`}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <FaShoppingBag className="h-4 w-4" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaClock className="h-3 w-3" />
                          Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        {order.deliveryDate && (
                          <span className="flex items-center gap-1">
                            <FaTruck className="h-3 w-3" />
                            Est. Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                        <FaEye className="h-4 w-4" />
                        View Details
                      </button>
                      {order.status === "delivered" && (
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                          <FaDownload className="h-4 w-4" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.products.map((item) => (
                      <div key={item.product._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="h-16 w-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.product.images?.[0] || "https://via.placeholder.com/100"} 
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{item.product.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>Color: {item.color || "Default"}</span>
                            <span>•</span>
                            <span>Size: {item.size || "Standard"}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            <FaRupeeSign className="inline h-3 w-3 mr-1" />
                            {(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <p className="text-sm text-gray-500">
                            <FaRupeeSign className="inline h-2.5 w-2.5 mr-0.5" />
                            {item.price.toLocaleString('en-IN')} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaTruck className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Shipping Address:</span>
                          <span>{order.shippingAddress?.street || "123 Main St"}, {order.shippingAddress?.city || "City"}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Payment: {order.paymentMethod || "Credit Card"} • {order.paymentStatus || "Paid"}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Order Total</div>
                        <div className="text-2xl font-bold text-gray-900">
                          <FaRupeeSign className="inline h-5 w-5 mr-1" />
                          {order.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  {order.status === "delivered" && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex flex-wrap gap-3">
                        <button className="px-5 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors">
                          Rate Products
                        </button>
                        <button className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors">
                          Buy Again
                        </button>
                        <button className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {orders.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{orders.length}</div>
                <div className="text-gray-700 font-medium">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-gray-700 font-medium">Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <FaRupeeSign className="inline h-5 w-5 mr-1" />
                  {orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('en-IN')}
                </div>
                <div className="text-gray-700 font-medium">Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}