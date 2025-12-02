import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaEye,
  FaFilter,
  FaSort,
  FaShoppingBag,
  FaUser,
  FaCalendar,
  FaMoneyBillWave,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaMapMarkerAlt,
  FaPhone,
  FaEdit
} from 'react-icons/fa';
import { getAllOrders, updateOrderToDelivered } from '../../services/orderService';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Since getAllOrders doesn't support pagination/filtering in your current service,
      // we'll fetch all and handle filtering on client-side
      const response = await getAllOrders();
      
      // Filter orders on client-side
      let filteredOrders = response.orders || [];
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchLower)) ||
          (order.receipt && order.receipt.toLowerCase().includes(searchLower)) ||
          (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(searchLower)) ||
          (order.user?.name && order.user.name.toLowerCase().includes(searchLower)) ||
          (order.user?.email && order.user.email.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply status filter
      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      
      // Apply payment status filter
      if (filters.paymentStatus) {
        filteredOrders = filteredOrders.filter(order => order.paymentStatus === filters.paymentStatus);
      }
      
      // Apply payment method filter
      if (filters.paymentMethod) {
        filteredOrders = filteredOrders.filter(order => order.paymentMethod === filters.paymentMethod);
      }
      
      // Apply date range filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filteredOrders = filteredOrders.filter(order => new Date(order.createdAt) <= endDate);
      }
      
      // Apply sorting
      filteredOrders.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
      
      setOrders(paginatedOrders);
      setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Only handle delivered status for now since that's the only function available
      if (newStatus === 'delivered') {
        await updateOrderToDelivered(orderId);
        toast.success('Order marked as delivered');
      } else {
        // For other statuses, you would need to implement updateOrderStatus function
        toast.info('Status update coming soon');
        return;
      }
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      startDate: '',
      endDate: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cod': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '🕒';
      case 'processing': return '⚙️';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber || selectedOrder.receipt}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedOrder.shippingAddress?.name || 'Guest'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p>{selectedOrder.shippingAddress?.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="bg-gray-50 rounded-lg">
                  {selectedOrder.products?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">₹{item.price?.toLocaleString('en-IN')} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>₹{selectedOrder.shippingPrice?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{selectedOrder.taxPrice?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-lg">₹{selectedOrder.grandTotal?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedOrder._id, 'delivered');
                      setShowOrderDetails(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-2">Manage customer orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <form onSubmit={handleSearch} className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cod">COD</option>
              </select>
            </div>
          </div>

          {/* Date Range & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                <option value="razorpay">Razorpay</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {orders.length} orders
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber || order.receipt || order._id?.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FaCalendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <FaBox className="h-3 w-3" />
                          Items: {order.products?.length || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {order.shippingAddress?.name || order.user?.name || 'Guest'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user?.email || order.shippingAddress?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">
                          ₹{order.grandTotal?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStatusIcon(order.status)}</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-sm font-medium rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === 'cod' ? 'COD' : order.paymentStatus}
                        </span>
                        {order.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <FaCheckCircle className="h-3 w-3" />
                            Paid
                          </span>
                        ) : order.paymentStatus === 'failed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600">
                            <FaTimesCircle className="h-3 w-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                            <span className="h-3 w-3">🕒</span>
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => showOrderDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Manage"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Link>
                        {order.status !== 'delivered' && (
                          <button
                            onClick={() => handleStatusChange(order._id, 'delivered')}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Mark as Delivered"
                          >
                            <FaTruck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <FaShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchTerm || Object.values(filters).some(f => f) 
                  ? 'Try adjusting your search or filters' 
                  : 'No orders have been placed yet'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}