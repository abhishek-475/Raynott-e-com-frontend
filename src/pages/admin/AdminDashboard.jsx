import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaShoppingBag, 
  FaUsers, 
  FaBoxOpen, 
  FaMoneyBillWave,
  FaChartLine,
  FaShoppingCart,
  FaTag,
  FaClock,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { getAllOrders } from '../../services/orderService';
import { getAllUsers } from '../../services/authService';
import { getProducts } from '../../services/productService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    pendingOrders: 0,
    averageOrderValue: 0,
    salesGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, year

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
        getAllOrders(),
        getAllUsers(),
        getProducts()
      ]);

      const orders = ordersResponse.orders || [];
      const users = usersResponse.users || [];
      const products = productsResponse.products || [];

      // Filter orders by time range
      const filteredOrders = filterOrdersByTimeRange(orders, timeRange);
      
      // Calculate statistics
      const totalSales = filteredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
      const totalOrders = filteredOrders.length;
      const totalUsers = users.length;
      const totalProducts = products.length;
      
      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Count pending orders
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      // Calculate average order value
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calculate sales growth (comparing with previous period)
      const previousPeriodOrders = filterOrdersByTimeRange(orders, getPreviousPeriod(timeRange));
      const previousPeriodSales = previousPeriodOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
      const salesGrowth = previousPeriodSales > 0 
        ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 
        : 0;

      setStats({
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        recentOrders,
        pendingOrders,
        averageOrderValue,
        salesGrowth
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTimeRange = (orders, range) => {
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return orders.filter(order => new Date(order.createdAt) >= startDate);
  };

  const getPreviousPeriod = (currentRange) => {
    switch (currentRange) {
      case 'day': return 'day';
      case 'week': return 'week';
      case 'month': return 'month';
      case 'year': return 'year';
      default: return 'month';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: <FaMoneyBillWave className="h-8 w-8" />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      link: '/admin/orders',
      change: stats.salesGrowth,
      description: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}ly sales`
    },
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      icon: <FaShoppingBag className="h-8 w-8" />,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      link: '/admin/orders',
      description: `${stats.pendingOrders} pending orders`
    },
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      icon: <FaUsers className="h-8 w-8" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      link: '/admin/users',
      description: 'Registered users'
    },
    {
      title: 'Total Products',
      value: formatNumber(stats.totalProducts),
      icon: <FaBoxOpen className="h-8 w-8" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      link: '/admin/products',
      description: 'Active products'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: <FaShoppingCart className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/products/create'
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit product categories',
      icon: <FaTag className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600',
      link: '/admin/categories'
    },
    {
      title: 'View Recent Orders',
      description: 'Check latest customer orders',
      icon: <FaClock className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600',
      link: '/admin/orders'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: <FaUsers className="h-6 w-6" />,
      color: 'bg-pink-100 text-pink-600',
      link: '/admin/users'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your store overview.</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time Range:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['day', 'week', 'month', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      timeRange === range
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                {stat.change !== undefined && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    stat.change >= 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change >= 0 ? (
                      <FaArrowUp className="h-3 w-3" />
                    ) : (
                      <FaArrowDown className="h-3 w-3" />
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{stat.title}</p>
              </div>
              
              <p className="text-sm text-gray-600">{stat.description}</p>
              
              <Link
                to={stat.link}
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View details
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((stats.averageOrderValue / 10000) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <FaClock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
            <Link
              to="/admin/orders?status=pending"
              className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Review pending orders
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <FaUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers > 0 
                    ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) 
                    : '0'}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalOrders} orders from {stats.totalUsers} users
            </p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <div className="flex items-center gap-4">
              <Link 
                to="/admin/orders" 
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All Orders
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderNumber || order.receipt || order._id?.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.shippingAddress?.name || order.user?.name || 'Guest'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.grandTotal || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.paymentStatus === 'cod'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus?.toUpperCase() || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent orders</h3>
              <p className="text-gray-600">No orders have been placed in the selected time range.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  <span>Take action</span>
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <FaChartLine className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Performance Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Process pending orders</p>
              <p className="text-xs text-gray-600">Review and process {stats.pendingOrders} pending orders to improve customer satisfaction.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Add new products</p>
              <p className="text-xs text-gray-600">Keep your store fresh by adding new products regularly to attract more customers.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-gray-900 mb-1">Review analytics</p>
              <p className="text-xs text-gray-600">Check your store performance metrics regularly to identify growth opportunities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}