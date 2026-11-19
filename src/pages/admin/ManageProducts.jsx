import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Eye,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Save,
  Upload,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import {
  cleanImageUrl,
  parseImageUrls,
  resolveProductImageUrl,
  FALLBACK_TOY_IMAGE,
} from '../../utils/imageUrlHelper';

const ManageProducts = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Quick Image Modal State
  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const [savingImages, setSavingImages] = useState(false);

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

  // Open Quick Image Modal
  const openImageModal = (prod) => {
    setImageModalProduct(prod);
    const existingImgs = Array.isArray(prod.productImages) && prod.productImages.length > 0
      ? prod.productImages
      : ['/logo.png'];
    setModalImages([...existingImgs]);
    setNewImageUrl('');
    setPreviewError(false);
  };

  const handleAddModalImageUrl = (e) => {
    if (e) e.preventDefault();
    if (!newImageUrl.trim()) return;

    const urls = parseImageUrls(newImageUrl);
    if (urls.length > 0) {
      setModalImages((prev) => [...prev.filter((img) => img !== '/logo.png'), ...urls]);
      setNewImageUrl('');
      setPreviewError(false);
      addToast(`${urls.length} image(s) added to preview! Click Save to apply.`, 'success');
    } else {
      addToast('Please enter a valid image URL', 'error');
    }
  };

  const handleRemoveModalImage = (index) => {
    setModalImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : ['/logo.png'];
    });
  };

  const handleSaveModalImages = async () => {
    if (!imageModalProduct) return;

    let finalImages = [...modalImages];
    if (newImageUrl.trim()) {
      const extra = parseImageUrls(newImageUrl);
      finalImages = [...finalImages.filter((img) => img !== '/logo.png'), ...extra];
    }

    if (finalImages.length === 0) {
      finalImages = ['/logo.png'];
    }

    try {
      setSavingImages(true);
      const { data } = await api.put(`/products/${imageModalProduct._id}`, {
        productImages: finalImages,
      });

      // Update products state locally
      setProducts((prev) =>
        prev.map((p) =>
          p._id === imageModalProduct._id
            ? { ...p, productImages: data.productImages || finalImages }
            : p
        )
      );

      addToast('Product images updated successfully! 📸', 'success');
      setImageModalProduct(null);
    } catch (err) {
      addToast(err.message || 'Failed to update product images', 'error');
    } finally {
      setSavingImages(false);
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
            Add, update prices, manage stock quantities, or update toy images & links
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95 cursor-pointer"
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
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium text-slate-800"
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
            className="px-4 py-2 bg-pink-500 text-white text-xs font-bold rounded-full inline-block cursor-pointer"
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
                {products.map((prod) => {
                  const mainImg = resolveProductImageUrl(prod.productImages?.[0]);

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* Clickable Image Box with Quick View/Edit */}
                          <div
                            className="relative flex-shrink-0 cursor-pointer group/thumb"
                            onClick={() => openImageModal(prod)}
                            title="Click to view & manage product images"
                          >
                            <img
                              src={mainImg}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                              }}
                              className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-100 flex-shrink-0 p-1 group-hover/thumb:ring-2 group-hover/thumb:ring-pink-400 group-hover/thumb:scale-105 transition-all shadow-2xs"
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
                          <button
                            onClick={() => openImageModal(prod)}
                            className="p-2 text-indigo-600 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View & Edit Images"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Image Manager Modal */}
      {imageModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setImageModalProduct(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading">
                  Product Image Manager 📸
                </h2>
                <p className="text-xs text-slate-500 truncate max-w-sm">
                  {imageModalProduct.name}
                </p>
              </div>
              <button
                onClick={() => setImageModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Images Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Active Product Images ({modalImages.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {modalImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group"
                  >
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_TOY_IMAGE;
                      }}
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-pink-500 text-white text-[9px] font-black rounded-md shadow-xs">
                        Cover
                      </span>
                    )}
                    {modalImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveModalImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Image by URL */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Paste Image URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... (Google, Unsplash, Amazon link)"
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddModalImageUrl(e);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400 font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddModalImageUrl}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  + Add
                </button>
              </div>

              {/* Instant Live URL Preview */}
              {(() => {
                const cleaned = cleanImageUrl(newImageUrl);
                if (cleaned.length > 8) {
                  return (
                    <div className="p-2 bg-white border border-pink-200 rounded-xl flex items-center gap-3 shadow-xs">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                        {!previewError ? (
                          <img
                            src={cleaned}
                            alt="Live URL Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onLoad={() => setPreviewError(false)}
                            onError={() => setPreviewError(true)}
                          />
                        ) : (
                          <div className="p-1 text-center">
                            <AlertCircle className="w-4 h-4 text-rose-500 mx-auto" />
                            <span className="text-[8px] text-rose-500 font-bold block">
                              Broken Link
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Image Ready to View
                        </span>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                          {cleaned}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t">
              <button
                type="button"
                onClick={() => setImageModalProduct(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalImages}
                disabled={savingImages}
                className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-full shadow-sm disabled:opacity-50 cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {savingImages ? 'Saving...' : 'Save Images'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
