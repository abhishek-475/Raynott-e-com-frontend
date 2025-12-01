import { createContext, useState, useEffect, useRef, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage on app start
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);

  // Sync user with localStorage on every user change
  useEffect(() => {
    if (!isMounted.current) return;

    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.token) {
          localStorage.setItem('token', user.token);
        }
      } catch (error) {
        console.error('Error syncing user to localStorage:', error);
      }
    }
  }, [user]);

  // Listen for storage events (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (!isMounted.current) return;

      if (event.key === 'user') {
        try {
          if (event.newValue) {
            const newUser = JSON.parse(event.newValue);
            if (JSON.stringify(user) !== event.newValue) {
              setUser(newUser);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const login = (userData) => {
    if (!userData || !userData.token) {
      console.error('Invalid user data provided to login');
      return false;
    }

    try {
      const completeUserData = {
        ...userData,
        id: userData.id || Date.now(),
        name: userData.name || 'User',
        email: userData.email,
        role: userData.role || 'user',
        token: userData.token
      };

      console.log('Logging in user:', completeUserData.email);
      
      setUser(completeUserData);
      
      localStorage.setItem('user', JSON.stringify(completeUserData));
      localStorage.setItem('token', completeUserData.token);

      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-login', {
        detail: { user: completeUserData }
      }));
      
      console.log('Login successful for:', completeUserData.email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      console.log('Logging out user:', user?.email);
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      setUser(null);
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-logout', {
        detail: { timestamp: Date.now() }
      }));
      
      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!user.token;
  };

  // Get user profile data
  const getUserProfile = () => {
    return user ? { ...user } : null;
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    if (!user) return false;
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      window.dispatchEvent(new CustomEvent('user-updated', {
        detail: { user: updatedUser }
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      // Auth state
      user,
      setUser,
      login,
      logout,
      isAuthenticated: isAuthenticated(),
      
      // User functions
      getUserProfile,
      updateUserProfile,
      
      // Loading state
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};