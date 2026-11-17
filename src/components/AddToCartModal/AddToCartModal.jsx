import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, ShoppingBag, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AddToCartModal = ({ isOpen, onClose, onConfirm, product, quantity = 1, loading = false }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Chennai',
    postalCode: '600001',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill fields from logged-in user or saved details in localStorage
  useEffect(() => {
    if (isOpen) {
      const savedDetails = localStorage.getItem('customerDetails');
      const parsedSaved = savedDetails ? JSON.parse(savedDetails) : {};

      setFormData({
        name: user?.name || parsedSaved.name || '',
        phone: user?.phone || parsedSaved.phone || '',
        email: user?.email || parsedSaved.email || '',
        address: parsedSaved.address || '',
        city: parsedSaved.city || 'Chennai',
        postalCode: parsedSaved.postalCode || '600001',
      });
      setErrors({});
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.trim().replace(/[\s\-+()]/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Save to localStorage for convenience
    localStorage.setItem(
      'customerDetails',
      JSON.stringify({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      })
    );

    onConfirm({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      postalCode: formData.postalCode.trim(),
    });
  };

  const currentPrice =
    product?.discountPrice && product.discountPrice > 0 ? product.discountPrice : product?.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Gradient Ribbon */}
          <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                  Customer Information
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Please provide your details to add this toy to your cart.
                </p>
              </div>
            </div>

            {/* Toy Preview Card (if product info is available) */}
            {product && (
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
                <img
                  src={product.productImages?.[0] || '/logo.png'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                  className="w-14 h-14 rounded-xl object-contain bg-white shrink-0 border border-white shadow-xs p-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate font-heading">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-extrabold text-pink-600 font-heading">
                      ₹{(currentPrice * quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-pink-100">
                      Qty: {quantity}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-pink-500 focus:ring-pink-100'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.name}</p>}
              </div>

              {/* Phone & Email (Side by Side on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-pink-500 focus:ring-pink-100'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-200 focus:border-pink-500 focus:ring-pink-100'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Door No, Street Name, Area, Landmark"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.address
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-pink-500 focus:ring-pink-100'
                    }`}
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.address}</p>
                )}
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Your details are safely stored in our database for fast toy delivery.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-pink-200 hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddToCartModal;
