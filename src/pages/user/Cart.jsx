import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Cart = () => {
  const { cart, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'TOYJOY') {
      setDiscountPercent(15);
      addToast('Promo code applied! 15% discount granted! 🎉', 'success');
    } else {
      addToast('Invalid promo code. Try "TOYJOY"', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-500 mx-auto flex items-center justify-center text-4xl">
          🧸
        </div>
        <h2 className="text-3xl font-black text-slate-900 font-heading">
          Your Toy Chest Awaits!
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please log in to view your cart items, apply member discounts, and proceed to checkout.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md shadow-pink-200"
          >
            Log In
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-sm"
          >
            Browse Toys
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const eligibleForFreeShipping = subtotal >= 999;
  const shippingFee = items.length === 0 || eligibleForFreeShipping ? 0 : 99;
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.05); // 5% GST
  const grandTotal = subtotal - discountAmount + shippingFee + estimatedTax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-pink-50 text-pink-500 mx-auto flex items-center justify-center text-5xl shadow-sm">
          🛍️
        </div>
        <h2 className="text-3xl font-black text-slate-900 font-heading">
          Your Toy Cart is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Looks like you haven't picked any toys yet! Explore our certified plushies, Lego sets, and interactive games to spark laughter.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black text-sm shadow-lg shadow-pink-200 transition-all active:scale-95"
        >
          <span>Explore Toy Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            Shopping Cart 🛍️
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            You have {totalItems} item{totalItems > 1 ? 's' : ''} in your cart
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Free shipping threshold banner */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-600" />
            {eligibleForFreeShipping
              ? '🎉 Congratulations! You qualify for FREE Delivery!'
              : `Add ₹${(999 - subtotal).toLocaleString('en-IN')} more to unlock FREE Delivery!`}
          </span>
          <span>{eligibleForFreeShipping ? '100%' : `${Math.min(100, Math.round((subtotal / 999) * 100))}%`}</span>
        </div>
        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const prod = item.product;
            if (!prod) return null;
            const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price;

            return (
              <div
                key={prod._id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <Link
                  to={`/product/${prod._id}`}
                  className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0"
                >
                  <img
                    src={prod.productImages?.[0] || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                    {prod.brand}
                  </span>
                  <Link
                    to={`/product/${prod._id}`}
                    className="block text-sm font-bold text-slate-800 hover:text-pink-600 truncate font-heading"
                  >
                    {prod.name}
                  </Link>
                  <p className="text-xs text-slate-400">Age: {prod.ageGroup}</p>
                  <div className="text-sm font-black text-slate-900 font-heading">
                    ₹{price.toLocaleString('en-IN')}
                    {prod.discountPrice > 0 && (
                      <span className="text-xs text-slate-400 line-through ml-2 font-normal">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-1">
                  <button
                    type="button"
                    disabled={item.quantity <= 1}
                    onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= prod.stockQuantity}
                    onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[90px]">
                  <p className="text-sm font-extrabold text-slate-900 font-heading">
                    ₹{(price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeFromCart(prod._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 font-heading border-b border-slate-100 pb-4">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-pink-500" /> Have a Coupon?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TOYJOY"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                >
                  Apply
                </button>
              </div>
              {discountPercent > 0 && (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> 15% ToyJoy discount applied!
                </p>
              )}
            </form>

            {/* Breakdown */}
            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-black">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>GST (5% tax)</span>
                <span className="font-bold text-slate-900">₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-base font-black text-slate-900 font-heading pt-3 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-pink-600 text-xl font-heading">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-pink-300/50 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Razorpay 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

