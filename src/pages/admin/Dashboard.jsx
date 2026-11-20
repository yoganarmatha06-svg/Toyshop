import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  PlusCircle,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/dashboard-stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return <Loader text="Calculating store metrics..." />;
  }

  const statCards = [
    {
      title: 'Total Sales Revenue',
      value: `₹${(stats.totalSales || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      bgColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Customer Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      bgColor: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Active Toy Catalog',
      value: stats.totalProducts || 0,
      icon: Package,
      bgColor: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers || 0,
      icon: Users,
      bgColor: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Store Overview & Control Panel 🚀
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Live metrics connected to MongoDB database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Link
            to="/admin/products/add"
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-2 active:scale-95 transition-all min-h-[42px]"
          >
            <PlusCircle className="w-4 h-4" /> Add New Toy
          </Link>
          <Link
            to="/admin/reports"
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center min-h-[42px]"
          >
            View Sales Reports
          </Link>
        </div>
      </div>

      {/* 4 Responsive Summary Cards: Desktop 4, Tablet 2, Mobile 1-2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 sm:gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0 ${stat.bgColor}`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 truncate">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-0.5 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Status Breakdown Badges */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3.5 sm:space-y-4">
        <h2 className="text-xs sm:text-sm font-black text-slate-900 font-heading uppercase tracking-wider">
          Order Status Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
            <p className="text-[11px] sm:text-xs font-bold text-amber-700">Pending</p>
            <p className="text-lg sm:text-xl font-black text-amber-900 font-heading">
              {stats.statusCounts?.pending || 0}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
            <p className="text-[11px] sm:text-xs font-bold text-blue-700">Processing</p>
            <p className="text-lg sm:text-xl font-black text-blue-900 font-heading">
              {stats.statusCounts?.processing || 0}
            </p>
          </div>
          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
            <p className="text-[11px] sm:text-xs font-bold text-sky-700">Shipped</p>
            <p className="text-lg sm:text-xl font-black text-sky-900 font-heading">
              {stats.statusCounts?.shipped || 0}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <p className="text-[11px] sm:text-xs font-bold text-emerald-700">Delivered</p>
            <p className="text-lg sm:text-xl font-black text-emerald-900 font-heading">
              {stats.statusCounts?.delivered || 0}
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center col-span-2 sm:col-span-1">
            <p className="text-[11px] sm:text-xs font-bold text-rose-700">Cancelled</p>
            <p className="text-lg sm:text-xl font-black text-rose-900 font-heading">
              {stats.statusCounts?.cancelled || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b pb-3.5">
            <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" /> Recent Customer Orders
            </h2>
            <Link to="/admin/orders" className="text-xs font-bold text-pink-600 hover:underline">
              View All Orders →
            </Link>
          </div>

          {stats.recentOrders?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders?.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-bold text-slate-700">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {order.user?.name || 'Customer'}
                      </td>
                      <td className="py-3 font-extrabold text-slate-900 font-heading">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/admin/orders`}
                          className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 font-bold text-[11px]"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3.5">
            <h2 className="text-sm sm:text-base font-black text-slate-900 font-heading flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
            </h2>
            <Link to="/admin/products" className="text-xs font-bold text-pink-600 hover:underline">
              Inventory →
            </Link>
          </div>

          {stats.lowStockProducts?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">All products have healthy stock! 🎉</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts?.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                >
                  <div className="truncate min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-amber-700 font-semibold truncate">
                      Category: {item.category?.name || 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="px-2 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[11px]">
                      {item.stockQuantity} left
                    </span>
                    <Link
                      to={`/admin/products/edit/${item._id}`}
                      className="text-[10px] font-bold text-slate-700 hover:underline bg-white px-2 py-1 rounded-md border min-h-[28px] flex items-center"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
