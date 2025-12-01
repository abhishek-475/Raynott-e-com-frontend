import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";

// Context
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { PaymentProvider } from './context/PaymentContext';

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

// React Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <PaymentProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              
              {/* Global Navbar */}
              <Navbar />

              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
                toastClassName="!rounded-lg"
                bodyClassName="!font-sans"
              />

              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/category/:category" element={<Categories />} />

                  {/* Protected Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/order/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetails />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile/:tab"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />
            </div>
            </PaymentProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;