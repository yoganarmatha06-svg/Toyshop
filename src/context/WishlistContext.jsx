import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist');
      setWishlist(data || []);
      const ids = new Set((data || []).map((p) => (typeof p === 'object' ? p._id : p)));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      addToast('Please log in to save items to your wishlist!', 'info');
      return false;
    }

    const pId = product._id || product;
    const isCurrentlyIn = wishlistIds.has(pId);

    try {
      const { data } = await api.post(`/wishlist/${pId}`);
      if (data.added) {
        addToast('Saved to your wishlist! 💖', 'success');
        setWishlistIds((prev) => new Set([...prev, pId]));
      } else {
        addToast('Removed from wishlist', 'info');
        setWishlistIds((prev) => {
          const updated = new Set(prev);
          updated.delete(pId);
          return updated;
        });
      }
      setWishlist(data.products || []);
      return data.added;
    } catch (err) {
      addToast(err.message, 'error');
      return isCurrentlyIn;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

