import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { toast } from "react-toastify";
import {
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaLock,
    FaShoppingBag,
    FaArrowRight
} from "react-icons/fa";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call the API
            const response = await loginUser({ email, password });
            
            console.log("Full response:", response);
            
            // Try different response structures
            let userData;
            
            // Case 1: Standard response with user object
            if (response.user) {
                userData = {
                    id: response.user.id || response.user._id,
                    name: response.user.name || response.user.username || 'User',
                    email: response.user.email || email,
                    token: response.token || response.accessToken,
                    role: response.user.role || 'user'
                };
            }
            // Case 2: Direct user object in response
            else if (response.id || response._id) {
                userData = {
                    id: response.id || response._id,
                    name: response.name || response.username || 'User',
                    email: response.email || email,
                    token: response.token || response.accessToken,
                    role: response.role || 'user'
                };
            }
            // Case 3: Minimal response with just token
            else if (response.token || response.accessToken) {
                userData = {
                    id: Date.now(), // Temporary ID
                    name: email.split('@')[0], // Use email prefix as name
                    email: email,
                    token: response.token || response.accessToken,
                    role: 'user'
                };
            }
            // Case 4: No valid response structure
            else {
                console.error("Unexpected response structure:", response);
                throw new Error("Invalid response from server");
            }
            
            console.log("Processed user data:", userData);
            
            // Call login function from AuthContext
            const success = login(userData);
            
            if (success) {
                toast.success("Welcome back! Login successful!");
                
                // Navigate to home - add a small delay to ensure state updates
                setTimeout(() => {
                    navigate("/", { replace: true });
                    // Optional: Force a gentle refresh
                    // window.location.reload();
                }, 100);
            } else {
                toast.error("Failed to save login session. Please try again.");
            }
        } catch (error) {
            console.error("Login error details:", error);
            
            // Provide more specific error messages
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message.includes("Network")) {
                toast.error("Network error. Please check your connection.");
            } else {
                toast.error("Login failed. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Test with mock data (for development)
    const handleTestLogin = async () => {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock user data
        const mockUserData = {
            id: 1,
            name: "Test User",
            email: email || "test@example.com",
            token: "mock-jwt-token-12345",
            role: "user"
        };
        
        console.log("Using mock user data:", mockUserData);
        
        // Call login function from AuthContext
        const success = login(mockUserData);
        
        if (success) {
            toast.success("Test login successful!");
            setTimeout(() => navigate("/"), 100);
        } else {
            toast.error("Test login failed.");
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                        <FaShoppingBag className="h-12 w-12 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    Welcome to ShopEase
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to access exclusive deals and manage your orders
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-gray-800 bg-gray-50 hover:bg-white"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => navigate("/forgot-password")}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 text-gray-800 bg-gray-50 hover:bg-white"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 p-1 rounded-lg transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <FaEye className="h-5 w-5 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="remember-me"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <FaArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {/* Development-only test button */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                type="button"
                                onClick={handleTestLogin}
                                className="w-full py-3 border border-yellow-400 text-yellow-700 bg-yellow-50 rounded-xl font-medium hover:bg-yellow-100 transition-colors"
                            >
                                🧪 Test Login (Dev Only)
                            </button>
                        )}
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600">
                            New to ShopEase?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors ml-1"
                            >
                                Create an account
                                <FaArrowRight className="inline ml-1 h-3 w-3" />
                            </button>
                        </p>
                        <p className="mt-2 text-center text-xs text-gray-500">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}