import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import AddToCartModal from '../components/AddToCartModal/AddToCartModal';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, setAuthData } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Cached customer details to ensure details are collected only 1 time
  const [customerDetails, setCustomerDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('customerDetails');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

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
      if (!localStorage.getItem('token') && !localStorage.getItem('customerDetails')) {
        setCustomerDetails(null);
      }
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart || { items: [] });
      setSubtotal(data.subtotal || 0);
      setTotalItems(data.totalItems || 0);

      if (data.customerDetails?.name && data.customerDetails?.address) {
        setCustomerDetails((prev) => prev || data.customerDetails);
        if (!localStorage.getItem('customerDetails')) {
          localStorage.setItem('customerDetails', JSON.stringify(data.customerDetails));
        }
      }
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
   * Helper to check whether customer details (Name, Phone, Delivery Address)
   * have already been collected for this user/session.
   */
  const getSavedCustomerDetails = () => {
    // 1. From context state
    if (customerDetails?.name && customerDetails?.address) {
      return customerDetails;
    }

    // 2. From localStorage
    try {
      const saved = localStorage.getItem('customerDetails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.address) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }

    // 3. From cart customerDetails (MongoDB)
    if (cart?.customerDetails?.name && cart?.customerDetails?.address) {
      return cart.customerDetails;
    }

    return null;
  };

  /**
   * Called whenever user clicks "Add to Cart".
   * For a NEW user (1st time): customer details (Name, Phone, Email, Delivery Address) are collected via modal.
   * For the SAME user (2nd time onwards): details are NOT asked again and toy is added directly!
   */
  const addToCart = async (productOrId, quantity = 1) => {
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

    // Check if user details have ALREADY been collected:
    const existingDetails = getSavedCustomerDetails();

    // 2nd time onwards: If details ALREADY exist, DO NOT open the modal! Add directly!
    if (existingDetails) {
      try {
        setLoading(true);
        const payload = {
          productId: prodId,
          quantity,
          ...existingDetails,
        };

        const { data } = await api.post('/cart', payload);

        setCart(data.cart);
        setSubtotal(data.subtotal);
        setTotalItems(data.totalItems);

        if (data.customerDetails) {
          setCustomerDetails(data.customerDetails);
          localStorage.setItem('customerDetails', JSON.stringify(data.customerDetails));
        }

        if (data.token && data.user && setAuthData && !isAuthenticated) {
          setAuthData(data.user, data.token);
        }

        addToast('Toy added to your cart successfully! 🛍️', 'success');
        return true;
      } catch (err) {
        console.error('Direct add to cart failed:', err);
        addToast(err.message || 'Failed to add item to cart', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 1st time only: Open details modal to collect Name, Phone, Email, Address
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
   * Process & Submit Add to Cart with User Details to Backend & MongoDB Database (1st time)
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

      // Save customer details so the modal NEVER opens again for subsequent adds
      setCustomerDetails(userDetails);
      localStorage.setItem('customerDetails', JSON.stringify(userDetails));

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
