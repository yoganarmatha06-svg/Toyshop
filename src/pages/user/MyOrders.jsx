import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const confirmedOrderId = searchParams.get('confirmed');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader text="Loading your toy shipments..." />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTimelineStep = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = steps.indexOf(status);
    return currentIdx >= 0 ? currentIdx : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Confirmation Banner if redirected from checkout */}
      {confirmedOrderId && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl sm:text-3xl">
            🎉
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-black font-heading">
              Hooray! Your Toy Order is Confirmed!
            </h2>
            <p className="text-xs text-white/90">
              Order ID: <span className="font-mono font-bold">#{confirmedOrderId.slice(-8).toUpperCase()}</span>. We are packing your joyful toys with extra care!
            </p>
          </div>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-full bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 shadow-sm min-h-[44px] flex items-center justify-center"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          My Toy Orders 📦
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Track real-time courier status and review your toy order history
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
          <div className="text-6xl">🧸</div>
          <h3 className="text-xl font-black text-slate-800 font-heading">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't ordered any toys yet. Start exploring our magical collection to create unforgettable childhood moments!
          </p>
          <Link
            to="/shop"
            className="px-8 py-3 rounded-full bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-200 inline-block hover:bg-pink-600"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = getTimelineStep(order.orderStatus);

            return (
              <div
                key={order._id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  confirmedOrderId === order._id
                    ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
                    : 'border-slate-100 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50/70 p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-slate-400 font-semibold block">Order Placed</span>
                      <span className="font-bold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Total Amount</span>
                      <span className="font-black text-slate-900 font-heading text-sm text-pink-600">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Ship To</span>
                      <span className="font-bold text-slate-800 truncate max-w-[140px] block" title={order.shippingAddress?.fullName}>
                        {order.shippingAddress?.fullName || 'Customer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Items</span>
                      <span className="font-bold text-slate-700">
                        {order.orderItems?.reduce((sum, i) => sum + (i.quantity || 1), 0)} Total
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                  {/* Status Timeline */}
                  {order.orderStatus !== 'Cancelled' && (
                    <div className="max-w-xl mx-auto py-2">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                        <div
                          className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 z-0 transition-all duration-500"
                          style={{ width: `${(stepIndex / 3) * 100}%` }}
                        />

                        {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
                          <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                idx <= stepIndex
                                  ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {idx <= stepIndex ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[10px] sm:text-[11px] font-bold mt-1.5 ${
                                idx <= stepIndex ? 'text-pink-600' : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Items (What was ordered) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                      Toys in this Order ({order.orderItems?.length})
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {order.orderItems.map((item, idx) => {
                        const prodId = item.product?._id || item.product;
                        const itemImg =
                          item.image ||
                          item.product?.productImages?.[0] ||
                          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';

                        return (
                          <div key={idx} className="py-3 flex items-center gap-3 sm:gap-4 group">
                            <Link to={`/product/${prodId}`} className="relative flex-shrink-0">
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform"
                              />
                            </Link>

                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${prodId}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-pink-600 line-clamp-1 block font-heading transition-colors"
                              >
                                {item.name}
                              </Link>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                                {item.product?.brand && (
                                  <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 font-extrabold text-[10px]">
                                    {item.product.brand}
                                  </span>
                                )}
                                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                                  Qty: <strong className="text-slate-800">{item.quantity}</strong>
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                                  ₹{item.price.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-xs sm:text-sm font-black text-slate-900 font-heading block">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              <Link
                                to={`/product/${prodId}`}
                                className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline mt-1 inline-block"
                              >
                                View Toy
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Address, Payment & Order Summary */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      <p className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
                        <MapPin className="w-4 h-4 text-pink-500" /> Delivery Address:
                      </p>
                      <p className="font-bold text-slate-900 text-sm">
                        {order.shippingAddress?.fullName || 'Customer'}
                      </p>
                      <p className="leading-relaxed text-slate-600 mt-1">
                        {order.shippingAddress?.streetAddress}, {order.shippingAddress?.city},{' '}
                        {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                      </p>
                      <p className="font-semibold text-slate-800 mt-2">
                        📞 Phone: {order.shippingAddress?.phoneNumber}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <p className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
                          <CreditCard className="w-4 h-4 text-pink-500" /> Payment & Billing:
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Payment Mode:</span>
                            <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Payment Status:</span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                                order.isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.isPaid ? 'PAID' : 'Cash on Delivery'}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900 font-heading">
                            <span>Amount Paid:</span>
                            <span className="text-pink-600">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200 flex justify-end">
                        <Link
                          to="/shop"
                          className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-sm shadow-pink-200 transition-all active:scale-95 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Buy More Toys
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

