import React, { useState, useEffect } from 'react';
import { Award, ShoppingBag, Download } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';

const SalesReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/admin/sales-reports');
        setReports(data);
      } catch (err) {
        console.error('Failed to load sales reports:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading || !reports) {
    return <Loader text="Generating toy analytics and revenue summaries..." />;
  }

  const monthlySales = reports.monthlySales || [];
  const topSellingToys = reports.topSellingToys || [];
  const categorySales = reports.categorySales || [];

  const totalRevenueAllTime = monthlySales.reduce((acc, m) => acc + m.revenue, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Sales & Revenue Analytics 📊
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Financial performance, top performing toys, and category market share
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Top 5 Best-Selling Toys */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 font-heading flex items-center gap-2 border-b pb-4">
            <Award className="w-5 h-5 text-amber-500" /> Top-Selling Toys by Volume
          </h2>

          {topSellingToys.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {topSellingToys.map((toy, idx) => (
                <div
                  key={toy.productId || idx}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/70 border border-slate-100"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <img
                    src={toy.image}
                    alt={toy.name}
                    className="w-12 h-12 rounded-xl object-cover bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{toy.name}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {toy.unitsSold} units ordered
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 font-heading">
                      ₹{toy.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-bold">Revenue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Revenue Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 font-heading flex items-center gap-2 border-b pb-4">
            <ShoppingBag className="w-5 h-5 text-pink-500" /> Revenue by Category
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {categorySales.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="text-slate-900 font-heading">
                    ₹{cat.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pink-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        totalRevenueAllTime > 0
                          ? Math.round((cat.revenue / totalRevenueAllTime) * 100)
                          : 15
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;

