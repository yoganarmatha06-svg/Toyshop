import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  MapPin,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';

const ManageOrders = () => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      };
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      addToast(`Order status updated to "${newStatus}"!`, 'success');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Shipped':
        return 'bg-sky-100 text-sky-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Manage Customer Orders 📦
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor incoming purchases, dispatch couriers, and update tracking status
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading customer orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-4xl">📦</p>
          <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-400">Try changing the status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{order.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {order.user?.email}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {order.orderItems?.length || 0} toy{order.orderItems?.length > 1 ? 's' : ''}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-900 font-heading">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          order.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.isPaid ? 'PAID' : 'UNPAID'} ({order.paymentMethod})
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-pink-50 text-pink-600 hover:bg-pink-100 font-bold text-xs"
                      >
                        View & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading">
                  Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Quick Status Modifier */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-xs font-black text-slate-800 font-heading uppercase tracking-wider">
                Change Order Status:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedOrder._id, st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.orderStatus === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Purchased Toys</h3>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-xs">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 font-heading">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-1 text-xs">
              <p className="font-bold text-pink-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-pink-600" /> Delivery Address
              </p>
              <p className="text-slate-800 font-bold">{selectedOrder.shippingAddress?.fullName}</p>
              <p className="text-slate-600 leading-relaxed">
                {selectedOrder.shippingAddress?.streetAddress}, {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
              </p>
              <p className="text-slate-700 font-semibold pt-1">
                📞 {selectedOrder.shippingAddress?.phoneNumber}
              </p>
            </div>

            {/* Financials */}
            <div className="border-t pt-3 flex justify-between text-sm font-black font-heading text-slate-900">
              <span>Total Paid:</span>
              <span className="text-pink-600 text-lg">
                ₹{selectedOrder.totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;

