import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaHeart,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaCreditCard,
  FaBell,
  FaLock,
  FaSignOutAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dob: "",
    gender: ""
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data and orders
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        dob: user.dob || "",
        gender: user.gender || ""
      });

      // Fetch user orders
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setOrders([
          {
            id: "ORD001",
            date: "2024-01-15",
            status: "delivered",
            total: 12999,
            items: 2,
            tracking: "TRK123456789"
          },
          {
            id: "ORD002",
            date: "2024-01-10",
            status: "shipped",
            total: 32999,
            items: 1,
            tracking: "TRK987654321"
          },
          {
            id: "ORD003",
            date: "2024-01-05",
            status: "processing",
            total: 99999,
            items: 1,
            tracking: null
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Save profile logic here
      console.log("Saving profile:", formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      dob: user.dob || "",
      gender: user.gender || ""
    });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "delivered": return "text-green-600 bg-green-50 border-green-200";
      case "shipped": return "text-blue-600 bg-blue-50 border-blue-200";
      case "processing": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "delivered": return "Delivered";
      case "shipped": return "Shipped";
      case "processing": return "Processing";
      default: return status;
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <FaUser /> },
    { id: "orders", label: "My Orders", icon: <FaShoppingBag /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
    { id: "addresses", label: "Addresses", icon: <FaMapMarkerAlt /> },
    { id: "security", label: "Security", icon: <FaLock /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> }
  ];

  const stats = [
    { label: "Total Orders", value: "12", icon: <FaShoppingBag />, color: "from-blue-500 to-cyan-500" },
    { label: "Wishlist Items", value: "8", icon: <FaHeart />, color: "from-pink-500 to-rose-500" },
    { label: "Total Spent", value: "₹1,45,999", icon: <FaCreditCard />, color: "from-green-500 to-emerald-500" },
    { label: "Avg. Rating", value: "4.8", icon: <FaStar />, color: "from-amber-500 to-orange-500" }
  ];

  const quickActions = [
    { label: "Track Order", icon: <FaTruck />, path: "/my-orders" },
    { label: "Update Password", icon: <FaLock />, path: "/profile?tab=security" },
    { label: "Manage Addresses", icon: <FaMapMarkerAlt />, path: "/profile?tab=addresses" },
    { label: "Notification Settings", icon: <FaBell />, path: "/profile?tab=notifications" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile</p>
          <a href="/login" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3">My Account</h1>
              <p className="text-blue-100 text-lg">Manage your profile, orders, and preferences</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Member since</p>
                <p className="font-semibold">Jan 2024</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* User Info Card */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <FaCheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-500">Verified Account</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold border-r-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <FaChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full py-3 text-red-600 hover:text-red-700 font-medium rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Account Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-2`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(action.path.split('=')[1])}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaSave className="h-4 w-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          <FaTimes className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaUser className="inline h-4 w-4 mr-2 text-gray-400" />
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.name}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaEnvelope className="inline h-4 w-4 mr-2 text-gray-400" />
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{formData.email}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaPhone className="inline h-4 w-4 mr-2 text-gray-400" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          {formData.phone || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaCalendarAlt className="inline h-4 w-4 mr-2 text-gray-400" />
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          {formData.dob || "Not provided"}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaMapMarkerAlt className="inline h-4 w-4 mr-2 text-gray-400" />
                        Complete Address
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street Address"
                          className="md:col-span-3 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="Pincode"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                      <a href="/products" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                        Start Shopping
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>Date: {order.date}</span>
                                <span>Items: {order.items}</span>
                                <span>Total: ₹{order.total.toLocaleString('en-IN')}</span>
                                {order.tracking && (
                                  <span>Tracking: {order.tracking}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <a
                                href={`/order/${order.id}`}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                              >
                                View Details
                              </a>
                              {order.status === "delivered" && (
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">
                                  Buy Again
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center pt-6">
                        <a
                          href="/my-orders"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View All Orders
                          <FaChevronRight className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later</p>
                    <a href="/products" className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-rose-700">
                      Start Shopping
                    </a>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                      Add New Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sample addresses */}
                    {[
                      { type: "Home", name: "John Doe", address: "123 Main Street, Mumbai", phone: "+91 98765 43210", default: true },
                      { type: "Office", name: "John Doe", address: "456 Business Park, Andheri East", phone: "+91 98765 43211", default: false }
                    ].map((addr, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-gray-900">{addr.type}</h3>
                              {addr.default && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{addr.name}</p>
                            <p className="text-gray-600 mb-1">{addr.address}</p>
                            <p className="text-gray-600">{addr.phone}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700">
                            <FaEdit className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          {!addr.default && (
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                              Set as Default
                            </button>
                          )}
                          <button className="text-sm text-red-600 hover:text-red-700">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaLock className="h-5 w-5 text-gray-600" />
                        Change Password
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input type="password" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <button className="mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                        Update Password
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaShieldAlt className="h-5 w-5 text-gray-600" />
                        Two-Factor Authentication
                      </h3>
                      <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
                      <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { label: "Order Updates", description: "Get notified about your order status", enabled: true },
                      { label: "Promotional Offers", description: "Receive deals and discounts", enabled: true },
                      { label: "New Arrivals", description: "Be the first to know about new products", enabled: false },
                      { label: "Price Drop Alerts", description: "Get notified when saved items go on sale", enabled: true },
                      { label: "Account Security", description: "Important security notifications", enabled: true }
                    ].map((pref, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-6">
                        <div>
                          <h3 className="font-medium text-gray-900">{pref.label}</h3>
                          <p className="text-sm text-gray-600">{pref.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                    <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}