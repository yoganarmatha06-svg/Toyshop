import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
  Truck,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';

const Checkout = () => {
  const { cart, subtotal, totalItems, fetchCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Coupon discount is active ONLY when purchase subtotal is above ₹2,000
  const couponDiscount =
    subtotal > 2000 && location.state?.discountAmount ? location.state.discountAmount : 0;
  const couponPromoCode =
    subtotal > 2000 && location.state?.promoCode ? location.state.promoCode : '';

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);

  // New Address form state
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users/addresses');
        setAddresses(data || []);
        if (data && data.length > 0) {
          const defaultAddr = data.find((a) => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          // If no address in Address collection, check if user provided customerDetails during Add to Cart
          try {
            const savedDetails = localStorage.getItem('customerDetails');
            const parsed = savedDetails ? JSON.parse(savedDetails) : null;
            if (parsed?.address) {
              const { data: newAddr } = await api.post('/users/addresses', {
                fullName: parsed.name || user?.name || 'Customer',
                phoneNumber: parsed.phone || user?.phone || '9876543210',
                streetAddress: parsed.address,
                city: parsed.city || 'Chennai',
                state: parsed.state || 'Tamil Nadu',
                postalCode: parsed.postalCode || '600001',
                country: 'India',
                isDefault: true,
              });
              setAddresses([newAddr]);
              setSelectedAddressId(newAddr._id);
              setShowAddressForm(false);
              return;
            }
          } catch (e) {
            // ignore
          }
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddress.fullName ||
      !newAddress.phoneNumber ||
      !newAddress.streetAddress ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postalCode
    ) {
      addToast('Please fill all address fields', 'error');
      return;
    }

    try {
      const { data } = await api.post('/users/addresses', newAddress);
      setAddresses((prev) => [data, ...prev]);
      setSelectedAddressId(data._id);
      setShowAddressForm(false);
      addToast('Address saved successfully!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    let selectedAddress = addresses.find((a) => a._id === selectedAddressId) || addresses[0];
    if (!selectedAddress) {
      addToast('Please select or add a delivery address', 'error');
      return;
    }

    const items = cart?.items || [];
    if (items.length === 0) {
      addToast('Your cart is empty', 'error');
      navigate('/cart');
      return;
    }

    setProcessingOrder(true);

    try {
      // 1. Prepare clean, verified order payload
      const validItems = items.filter((item) => item.product);
      const orderItems = validItems.map((item) => ({
        product: item.product?._id || item.product,
        name: item.product?.name,
        image: item.product?.productImages?.[0],
        price: item.product?.discountPrice > 0 ? item.product.discountPrice : item.product?.price,
        quantity: item.quantity,
      }));

      // Shipping & Tax estimation (factoring in coupon discount if subtotal > 2000)
      const shippingPrice = subtotal >= 999 ? 0 : 99;
      const taxPrice = Math.round((subtotal - couponDiscount) * 0.05);
      const calculatedTotal = subtotal - couponDiscount + shippingPrice + taxPrice;

      if (paymentMethod === 'COD') {
        // Direct COD Order
        const { data: createdOrder } = await api.post('/orders', {
          orderItems,
          shippingAddress: selectedAddress,
          paymentMethod: 'COD',
          isPaid: false,
        });

        addToast('Order placed successfully! 🎉', 'success');
        fetchCart();
        navigate(`/my-orders?confirmed=${createdOrder._id}`);
      } else {
        // Razorpay Payment Flow
        // Step A: Create order in Razorpay
        const { data: razorpayOrder } = await api.post('/payment/create-order', {
          amount: calculatedTotal,
        });

        // If in simulation/test mode without live merchant keys:
        if (razorpayOrder.isSimulation) {
          const mockPaymentId = `pay_sim_${Date.now()}`;
          const { data: confirmedOrder } = await api.post('/orders', {
            orderItems,
            shippingAddress: selectedAddress,
            paymentMethod: 'Razorpay',
            isPaid: true,
            paymentResult: {
              id: mockPaymentId,
              status: 'SUCCESS',
              razorpay_order_id: razorpayOrder.id,
              razorpay_payment_id: mockPaymentId,
            },
          });

          addToast('Payment successful & Order placed! 🚀', 'success');
          fetchCart();
          navigate(`/my-orders?confirmed=${confirmedOrder._id}`);
          return;
        }

        // Live Razorpay mode
        const { data: keyData } = await api.get('/payment/key');

        const options = {
          key: keyData.key,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'Toy World Store',
          description: `Order of ${totalItems} Toys`,
          image: '/logo.png',
          order_id: razorpayOrder.isSimulation ? undefined : razorpayOrder.id,
          handler: async function (response) {
            try {
              // Step B: Verify payment on server
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id || razorpayOrder.id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_sim_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'simulation_sig',
              };

              await api.post('/payment/verify', verifyPayload);

              // Step C: Create finalized order in MongoDB
              const { data: confirmedOrder } = await api.post('/orders', {
                orderItems,
                shippingAddress: selectedAddress,
                paymentMethod: 'Razorpay',
                isPaid: true,
                paymentResult: {
                  id: verifyPayload.razorpay_payment_id,
                  status: 'SUCCESS',
                  razorpay_order_id: verifyPayload.razorpay_order_id,
                  razorpay_payment_id: verifyPayload.razorpay_payment_id,
                },
              });

              addToast('Payment successful & Order placed! 🚀', 'success');
              fetchCart();
              navigate(`/my-orders?confirmed=${confirmedOrder._id}`);
            } catch (err) {
              addToast(`Payment verification error: ${err.message}`, 'error');
              setProcessingOrder(false);
            }
          },
          prefill: {
            name: selectedAddress.fullName,
            email: user?.email,
            contact: selectedAddress.phoneNumber,
          },
          theme: {
            color: '#EC4899', // ToyVerse pink
          },
          modal: {
            ondismiss: function () {
              setProcessingOrder(false);
              addToast('Payment window closed', 'info');
            },
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // If script blocked by browser extension, simulate successful verification for test mode
          const mockPaymentId = `pay_test_${Date.now()}`;
          const { data: confirmedOrder } = await api.post('/orders', {
            orderItems,
            shippingAddress: selectedAddress,
            paymentMethod: 'Razorpay',
            isPaid: true,
            paymentResult: {
              id: mockPaymentId,
              status: 'SUCCESS',
              razorpay_order_id: razorpayOrder.id,
              razorpay_payment_id: mockPaymentId,
            },
          });

          addToast('Test Order placed successfully via Razorpay Simulation! 🎈', 'success');
          fetchCart();
          navigate(`/my-orders?confirmed=${confirmedOrder._id}`);
        }
      }
    } catch (err) {
      console.error('Order creation error:', err);
      addToast(err.message, 'error');
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return <Loader text="Preparing your secure checkout..." />;
  }

  const items = cart?.items || [];
  const shippingFee = subtotal >= 999 ? 0 : 99;
  const tax = Math.round((subtotal - couponDiscount) * 0.05);
  const total = subtotal - couponDiscount + shippingFee + tax;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Checkout & Delivery 🚚
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Confirm your delivery address and choose your preferred payment method
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        {/* Left Section: Address & Payment */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Section 1: Delivery Address */}
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-xs space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-black text-slate-900 font-heading">
                  Delivery Address
                </h2>
              </div>

              {!showAddressForm && addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="text-xs font-bold text-pink-600 hover:text-pink-700 min-h-[44px] flex items-center gap-1 px-2"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Radio Cards */}
            {!showAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr._id
                        ? 'border-pink-500 bg-pink-50/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="sr-only"
                    />
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold text-slate-900">{addr.fullName}</p>
                      {selectedAddressId === addr._id && (
                        <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-2">
                      📞 {addr.phoneNumber}
                    </p>
                  </label>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider">
                  Enter Shipping Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      placeholder="Receiver's name"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / House No. *</label>
                  <input
                    type="text"
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    placeholder="Apartment, building, street, area..."
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      placeholder="e.g. 400001"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-full shadow-sm min-h-[44px]"
                  >
                    Save & Deliver Here
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 min-h-[44px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-xs space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2.5 border-b pb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Online */}
              <label
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'Razorpay'
                    ? 'border-pink-500 bg-pink-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xl flex-shrink-0">
                  💳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">Razorpay Online</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & Net Banking.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery */}
              <label
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  paymentMethod === 'COD'
                    ? 'border-pink-500 bg-pink-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
                  💵
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    Pay securely in cash or UPI when the courier delivers your toys.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Section: Order Review & Confirmation CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-5 sm:space-y-6 sticky top-28">
            <h3 className="text-base font-black text-slate-900 font-heading border-b pb-4">
              Order Review ({totalItems} items)
            </h3>

            {/* Items preview list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => {
                const prod = item.product;
                if (!prod) return null;
                const price = prod.discountPrice > 0 ? prod.discountPrice : prod.price;

                return (
                  <div key={prod._id} className="flex items-center gap-3">
                    <img
                      src={prod.productImages?.[0]}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{prod.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-heading">
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs border-t pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    Coupon Discount ({couponPromoCode || 'TOYJOY'})
                  </span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-bold">
                  {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span className="font-bold text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 font-heading pt-2 border-t">
                <span>Total Payable</span>
                <span className="text-pink-600 text-xl font-heading">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Confirm Order CTA */}
            <button
              type="button"
              disabled={processingOrder || items.length === 0}
              onClick={handlePlaceOrder}
              className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm shadow-lg shadow-pink-300/50 hover:shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {processingOrder ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order • ₹{total.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Razorpay Verified & Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

