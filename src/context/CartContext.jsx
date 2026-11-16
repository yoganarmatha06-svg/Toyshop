import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import AddToCartModal from '../components/AddToCartModal/AddToCartModal';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, setAuthData } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal State for collecting required user details (Name, Phone, Email, Address)
  const [modalState, setModalState] = useState({
    isOpen: false,
    product: null,
    productId: null,
    quantity: 1,
  });

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      setSubtotal(0);
      setTotalItems(0);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart || { items: [] });
      setSubtotal(data.subtotal || 0);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Failed to fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Called whenever user clicks "Add to Cart".
   * Opens the Customer Details Modal to collect required details: Name, Phone, Email, Address.
   */
  const addToCart = (productOrId, quantity = 1) => {
    let productObj = null;
    let prodId = null;

    if (typeof productOrId === 'object' && productOrId !== null) {
      productObj = productOrId;
      prodId = productOrId._id;
    } else {
      prodId = productOrId;
    }

    if (!prodId) {
      addToast('Invalid product selected', 'error');
      return;
    }

    // Open the details modal
    setModalState({
      isOpen: true,
      product: productObj,
      productId: prodId,
      quantity,
    });
  };

  /**
   * Close the Add to Cart details modal
   */
  const closeAddToCartModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  /**
   * Process & Submit Add to Cart with User Details to Backend & MongoDB Database
   */
  const handleConfirmAddToCart = async (userDetails) => {
    try {
      setModalLoading(true);
      const payload = {
        productId: modalState.productId,
        quantity: modalState.quantity,
        name: userDetails.name,
        phone: userDetails.phone,
        email: userDetails.email,
        address: userDetails.address,
        city: userDetails.city,
        postalCode: userDetails.postalCode,
      };

      const { data } = await api.post('/cart', payload);

      // Update Cart state
      setCart(data.cart);
      setSubtotal(data.subtotal);
      setTotalItems(data.totalItems);

      // If user/token is returned (e.g. for guest users), auto-authenticate in session
      if (data.token && data.user && setAuthData) {
        setAuthData(data.user, data.token);
      }

      // Close modal
      closeAddToCartModal();
      addToast('Toy added to your cart successfully! 🛍️', 'success');
      return true;
    } catch (err) {
      console.error('Add to cart failed:', err);
      addToast(err.message || 'Failed to add item to cart', 'error');
      return false;
    } finally {
      setModalLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data.cart);
      setSubtotal(data.subtotal);
      setTotalItems(data.totalItems);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart);
      setSubtotal(data.subtotal);
      setTotalItems(data.totalItems);
      addToast('Item removed from cart', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      setSubtotal(0);
      setTotalItems(0);
      return;
    }
    try {
      await api.delete('/cart');
      setCart({ items: [] });
      setSubtotal(0);
      setTotalItems(0);
    } catch (err) {
      console.error('Failed to clear cart:', err.message);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        totalItems,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}

      {/* Global Add to Cart Modal for collecting required user details */}
      <AddToCartModal
        isOpen={modalState.isOpen}
        onClose={closeAddToCartModal}
        onConfirm={handleConfirmAddToCart}
        product={modalState.product}
        quantity={modalState.quantity}
        loading={modalLoading}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
