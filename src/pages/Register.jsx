import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaShoppingBag,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaGift
} from "react-icons/fa";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    calculatePasswordStrength(value);
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 75) return "bg-green-500";
    if (passwordStrength >= 50) return "bg-yellow-500";
    if (passwordStrength >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (passwordStrength >= 75) return "Strong";
    if (passwordStrength >= 50) return "Medium";
    if (passwordStrength >= 25) return "Weak";
    return "Very Weak";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Registering user...");
      
      const response = await registerUser({ 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log("API Response:", response);
      
      if (response && response.user && response.token) {
        const userData = {
          ...response.user,
          token: response.token
        };
        login(userData);
        toast.success("🎉 Registration successful! Welcome!");
        navigate("/");
      } 
      else if (response && (response._id || response.id) && response.token) {
        login(response);
        toast.success("🎉 Registration successful! Welcome!");
        navigate("/");
      }
      else if (response && response._id && !response.token) {
        toast.success("✅ Account created successfully! Please login.");
        navigate("/login");
      }
      else if (response && response.message) {
        toast.success(response.message);
        navigate("/login");
      }
      else {
        toast.success("✅ Account created successfully!");
        navigate("/login");
      }

    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains number", met: /[0-9]/.test(password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column - Branding & Benefits */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 text-white shadow-2xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <FaShoppingBag className="h-8 w-8" />
                </div>
                <span className="text-3xl font-bold">Raynott</span>
              </div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Join India's Fastest Growing
                <span className="block text-yellow-300">E-Commerce Platform</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Create your account and unlock exclusive benefits designed for smart shoppers.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaGift className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Welcome Bonus</h3>
                  <p className="text-blue-100">Get ₹100 off on your first purchase</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Fast Delivery</h3>
                  <p className="text-blue-100">Same-day delivery in major cities</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Easy Returns</h3>
                  <p className="text-blue-100">30-day hassle-free returns</p>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-center font-medium">
                <span className="text-yellow-300">2M+</span> Happy Customers • <span className="text-yellow-300">4.8</span> ★ Average Rating
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
              <FaUser className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Sign up to start shopping</p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Password Strength</span>
                    <span className={`font-semibold ${
                      passwordStrength >= 75 ? 'text-green-600' :
                      passwordStrength >= 50 ? 'text-yellow-600' :
                      passwordStrength >= 25 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-300 ring-1 ring-red-100' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center gap-2">
                  {password === confirmPassword ? (
                    <>
                      <FaCheck className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <FaTimes className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </button>
              </label>
            </div>

           

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3.5 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold rounded-xl transition-all duration-300"
            >
              Sign In to Existing Account
            </button>
          </form>

          {/* Trust Badges - Mobile */}
          <div className="mt-8 grid grid-cols-3 gap-4 lg:hidden">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-bold">₹100</div>
              <div className="text-xs text-gray-600">Welcome Bonus</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 font-bold">Free</div>
              <div className="text-xs text-gray-600">Delivery*</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-bold">30 Days</div>
              <div className="text-xs text-gray-600">Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}