import { createContext, useState, useContext, useEffect, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
        setCartCount(savedCart.length);
        calculateTotal(savedCart);
        console.log('Cart loaded:', savedCart.length, 'items');
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    };

    loadCart();
  }, []);

  // Calculate total
  const calculateTotal = useCallback((items) => {
    const total = items.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
    setCartTotal(total);
    return total;
  }, []);

  // Save to localStorage and update state
  const saveCart = useCallback((newCart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartItems(newCart);
      setCartCount(newCart.length);
      calculateTotal(newCart);
      setRefreshKey(prev => prev + 1);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('cart-state-changed', {
        detail: { items: newCart, count: newCart.length }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  }, [calculateTotal]);

  // Add to cart
  const addToCart = useCallback((item) => {
    if (!item || !item.id) {
      console.error('Invalid item');
      return false;
    }

    setIsLoading(true);
    try {
      const currentCart = [...cartItems];
      const existingIndex = currentCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingIndex >= 0) {
        // Update quantity if item exists
        currentCart[existingIndex].quantity += item.quantity || 1;
      } else {
        // Add new item with unique cartId
        currentCart.push({
          ...item,
          quantity: item.quantity || 1,
          cartId: `${item.id}-${Date.now()}`, // Unique ID for React keys
          addedAt: new Date().toISOString()
        });
      }
      
      const success = saveCart(currentCart);
      if (success) {
        console.log('Item added to cart:', item.id);
      }
      return success;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, saveCart]);

  // Remove from cart
  const removeFromCart = useCallback((itemId) => {
    setIsLoading(true);
    try {
      const newCart = cartItems.filter(item => item.id !== itemId);
      const success = saveCart(newCart);
      if (success) {
        console.log('Item removed from cart:', itemId);
      }
      return success;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, saveCart]);

  // Update quantity
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    
    setIsLoading(true);
    try {
      const newCart = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      const success = saveCart(newCart);
      if (success) {
        console.log('Quantity updated:', itemId, '->', quantity);
      }
      return success;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cartItems, removeFromCart, saveCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setIsLoading(true);
    try {
      const success = saveCart([]);
      if (success) {
        console.log('Cart cleared');
      }
      return success;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveCart]);

  // Check if item is in cart
  const isInCart = useCallback((itemId) => {
    return cartItems.some(item => item.id === itemId);
  }, [cartItems]);

  // Get item quantity
  const getItemQuantity = useCallback((itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Refresh cart (force reload from localStorage)
  const refreshCart = useCallback(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(savedCart);
      setCartCount(savedCart.length);
      calculateTotal(savedCart);
      setRefreshKey(prev => prev + 1);
      console.log('Cart refreshed');
      return savedCart;
    } catch (error) {
      console.error('Error refreshing cart:', error);
      return [];
    }
  }, [calculateTotal]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        refreshCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCart]);

  // Listen for auth context changes (user login/logout)
  useEffect(() => {
    const handleUserLogin = () => {
      refreshCart();
    };

    const handleUserLogout = () => {
      // Optionally clear cart on logout or keep it
      // clearCart();
      refreshCart();
    };

    window.addEventListener('user-login', handleUserLogin);
    window.addEventListener('user-logout', handleUserLogout);
    
    return () => {
      window.removeEventListener('user-login', handleUserLogin);
      window.removeEventListener('user-logout', handleUserLogout);
    };
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{
      // State
      cartItems,
      cartCount,
      cartTotal,
      isLoading,
      refreshKey,
      
      // Actions
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart,
      isInCart,
      getItemQuantity,
      
      // Utility
      getCartItems: () => cartItems,
      getCartTotal: () => cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};