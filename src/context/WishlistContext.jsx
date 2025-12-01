import { createContext, useState, useEffect, useCallback } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Similar implementation as CartContext
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        setWishlistItems(savedWishlist);
        setWishlistCount(savedWishlist.length);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistItems([]);
        setWishlistCount(0);
      }
    };

    loadWishlist();
  }, []);

  const saveWishlist = useCallback((newWishlist) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setWishlistItems(newWishlist);
      setWishlistCount(newWishlist.length);
      
      window.dispatchEvent(new CustomEvent('wishlist-state-changed', {
        detail: { items: newWishlist, count: newWishlist.length }
      }));
      
      return true;
    } catch (error) {
      console.error('Error saving wishlist:', error);
      return false;
    }
  }, []);

  const addToWishlist = useCallback((item) => {
    if (!item || !item.id) return false;
    
    setIsLoading(true);
    try {
      const currentWishlist = [...wishlistItems];
      
      if (!currentWishlist.some(wishlistItem => wishlistItem.id === item.id)) {
        currentWishlist.push({
          ...item,
          addedAt: new Date().toISOString()
        });
        const success = saveWishlist(currentWishlist);
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItems, saveWishlist]);

  const removeFromWishlist = useCallback((itemId) => {
    setIsLoading(true);
    try {
      const newWishlist = wishlistItems.filter(item => item.id !== itemId);
      const success = saveWishlist(newWishlist);
      return success;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItems, saveWishlist]);

  const isInWishlist = useCallback((itemId) => {
    return wishlistItems.some(item => item.id === itemId);
  }, [wishlistItems]);

  const refreshWishlist = useCallback(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      setWishlistItems(savedWishlist);
      setWishlistCount(savedWishlist.length);
      return savedWishlist;
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'wishlist') {
        refreshWishlist();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      refreshWishlist,
      getWishlistItems: () => wishlistItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};