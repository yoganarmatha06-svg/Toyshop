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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Confirmation Banner if redirected from checkout */}
      {confirmedOrderId && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            🎉
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-black font-heading">
              Hooray! Your Toy Order is Confirmed!
            </h2>
            <p className="text-xs text-white/90">
              Order ID: <span className="font-mono font-bold">#{confirmedOrderId.slice(-8).toUpperCase()}</span>. We are packing your joyful toys with extra care!
            </p>
          </div>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-full bg-white text-emerald-700 font-bold text-xs hover:bg-emerald-50 shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 font-heading">
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
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Total</span>
                      <span className="font-bold text-slate-800">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block">Ship To</span>
                      <span className="font-bold text-slate-800 truncate max-w-[120px] block">
                        {order.shippingAddress?.fullName}
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

                <div className="p-6 sm:p-8 space-y-6">
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
                              className={`text-[11px] font-bold mt-1.5 ${
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

                  {/* Order Items */}
                  <div className="divide-y divide-slate-100">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-50 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.product}`}
                            className="text-xs font-bold text-slate-800 hover:text-pink-600 truncate block font-heading"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 font-heading">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address & Payment Info */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                    <div>
                      <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-pink-500" /> Shipping Destination:
                      </p>
                      <p className="leading-relaxed">
                        {order.shippingAddress?.fullName}, {order.shippingAddress?.streetAddress},{' '}
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                        {order.shippingAddress?.postalCode}
                      </p>
                      <p className="font-bold text-slate-700 mt-1">
                        Phone: {order.shippingAddress?.phoneNumber}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-pink-500" /> Payment Summary:
                      </p>
                      <p>Method: <span className="font-bold">{order.paymentMethod}</span></p>
                      <p>
                        Status:{' '}
                        <span
                          className={`font-bold ${
                            order.isPaid ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {order.isPaid ? 'PAID' : 'Pending Payment'}
                        </span>
                      </p>
                      {order.paymentResult?.id && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {order.paymentResult.id}
                        </p>
                      )}
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

