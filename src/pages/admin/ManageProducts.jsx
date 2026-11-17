import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';

const ManageProducts = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        keyword: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        featured: featuredOnly ? 'true' : undefined,
      };
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, featuredOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleFeatured = async (id, currentStatus, name) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/products/${id}`, { isFeatured: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFeatured: newStatus } : p))
      );
      addToast(
        newStatus
          ? `⭐ "${name}" added to Featured Toys on Website!`
          : `"${name}" removed from Featured Toys`,
        'success'
      );
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from store inventory?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await api.delete(`/products/${id}`);
      addToast(`"${name}" removed successfully!`, 'success');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Manage Toy Inventory 🧸
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Add, update prices, manage stock quantities, or delete toy listings
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Toy
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by toy name or brand..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFeaturedOnly((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              featuredOnly
                ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Featured Only</span>
          </button>

          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <Loader text="Loading toy catalog..." />
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <p className="text-4xl">🧸</p>
          <h3 className="text-lg font-bold text-slate-800">No toys match your criteria</h3>
          <Link
            to="/admin/products/add"
            className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full inline-block"
          >
            Add First Toy
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Toy Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Brand / Age</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={prod.productImages?.[0] || '/logo.png'}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.src = '/logo.png';
                            }}
                            className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-100 flex-shrink-0 p-1"
                          />
                          {prod.productImages && prod.productImages.length > 1 && (
                            <span
                              className="absolute -bottom-1 -right-1 bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs ring-1 ring-white"
                              title={`${prod.productImages.length} images available`}
                            >
                              +{prod.productImages.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="truncate max-w-xs">
                          <Link
                            to={`/product/${prod._id}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-pink-600 block truncate font-heading"
                          >
                            {prod.name}
                          </Link>
                          {prod.isFeatured && (
                            <span className="inline-flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md mt-0.5">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {prod.category?.name || 'Unassigned'}
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{prod.brand}</p>
                      <p className="text-[10px] text-slate-400">{prod.ageGroup}</p>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-baseline gap-1.5 font-heading">
                        <span className="font-extrabold text-slate-900">
                          ₹{(prod.discountPrice > 0 ? prod.discountPrice : prod.price).toLocaleString('en-IN')}
                        </span>
                        {prod.discountPrice > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          prod.stockQuantity > 5
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.stockQuantity > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.stockQuantity} in stock
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${prod._id}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                          title="View on Store"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${prod._id}`}
                          className="p-2 text-pink-600 hover:text-pink-700 rounded-lg hover:bg-pink-50"
                          title="Edit Toy Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          disabled={deletingId === prod._id}
                          onClick={() => handleDeleteProduct(prod._id, prod.name)}
                          className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                          title="Delete Toy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;

