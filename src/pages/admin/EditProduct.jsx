import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  ArrowLeft,
  Star,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';

const EditProduct = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrlError, setPreviewUrlError] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [ageGroup, setAgeGroup] = useState('3-5 Years');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [isFeatured, setIsFeatured] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('In Stock');

  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/${id}`),
        ]);

        setCategories(catRes.data || []);
        const prod = prodRes.data;

        setName(prod.name || '');
        setDescription(prod.description || '');
        setPrice(prod.price || '');
        setDiscountPrice(prod.discountPrice || '');
        setCategory(prod.category?._id || prod.category || '');
        setBrand(prod.brand || '');
        setAgeGroup(prod.ageGroup || '3-5 Years');
        setStockQuantity(prod.stockQuantity !== undefined ? prod.stockQuantity : 10);
        setIsFeatured(Boolean(prod.isFeatured));
        setAvailabilityStatus(prod.availabilityStatus || 'In Stock');
        const imgs = Array.isArray(prod.productImages) && prod.productImages.length > 0
          ? prod.productImages.filter(Boolean)
          : Array.isArray(prod.images) && prod.images.length > 0
          ? prod.images.filter(Boolean)
          : prod.image ? [prod.image] : [];
        setImageUrls(imgs);
      } catch (err) {
        console.error('Failed to load toy for editing:', err.message);
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    if (!newImageUrl.trim()) return;

    // Split by commas, newlines, or whitespace to support pasting multiple URLs at once
    const urls = newImageUrl
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length > 0) {
      setImageUrls((prev) => [...prev, ...urls]);
      setNewImageUrl('');
      setPreviewUrlError(false);
      addToast(`${urls.length} image(s) added! 🖼️`, 'success');
    }
  };

  const handleRemoveImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsCoverImage = (index) => {
    if (index === 0) return;
    setImageUrls((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
    addToast('Set as main cover image! ⭐', 'success');
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= imageUrls.length) return;
    setImageUrls((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const clearAllImages = () => {
    if (window.confirm('Remove all images from this product?')) {
      setImageUrls([]);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset input value immediately so user can select the same or more files again
    e.target.value = '';

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      setUploadingImage(true);
      const { data } = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.imageUrls && data.imageUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...data.imageUrls]);
        addToast(
          data.storage === 'cloudinary'
            ? `${data.imageUrls.length} image(s) uploaded to Cloudinary! ☁️`
            : `${data.imageUrls.length} image(s) uploaded successfully! 📸`,
          'success'
        );
      }
    } catch (err) {
      console.warn('Multer upload failed, using high-res local image reading fallback...', err);
      // Fallback: convert files to Base64 Data URLs so images are NEVER lost!
      try {
        const base64Promises = files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        );
        const base64Images = await Promise.all(base64Promises);
        setImageUrls((prev) => [...prev, ...base64Images]);
        addToast(`${base64Images.length} image(s) added successfully!`, 'success');
      } catch (readErr) {
        addToast(err.message || 'Failed to process images', 'error');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !category) {
      addToast('Please provide a toy name and category', 'error');
      return;
    }

    // Auto-commit any pending URL the user might have pasted into the input without clicking 'Add'
    let finalImages = [...imageUrls];
    if (newImageUrl.trim()) {
      const extraUrls = newImageUrl
        .split(/[\n,\s]+/)
        .map((u) => u.trim())
        .filter((u) => u.length > 0);
      finalImages = [...finalImages, ...extraUrls];
    }

    if (finalImages.length === 0) {
      finalImages = ['/logo.png'];
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: price !== '' ? Number(price) : 0,
        discountPrice: discountPrice !== '' ? Number(discountPrice) : 0,
        category,
        brand: brand.trim() || 'ToyWorld',
        ageGroup: ageGroup || '3-5 Years',
        stockQuantity: stockQuantity !== '' ? Number(stockQuantity) : 10,
        productImages: finalImages,
        isFeatured,
        availabilityStatus,
      };

      await api.put(`/products/${id}`, payload);
      addToast('Toy updated successfully! 🎉', 'success');
      navigate('/admin/products');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Retrieving toy data for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Edit Mode
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Edit Toy Details ✏️
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Update pricing, replenish inventory stock, edit description, or manage photo gallery
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Toy Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age Group *</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="0-2 Years">0-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="6-8 Years">6-8 Years</option>
                <option value="9-12 Years">9-12 Years</option>
                <option value="12+ Years">12+ Years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Type price"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setPrice(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Type discount price"
                value={discountPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setDiscountPrice(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Type stock"
                value={stockQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*$/.test(val)) {
                    setStockQuantity(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          {/* Availability Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Status</label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-order">Pre-order</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-black text-slate-900 font-heading uppercase tracking-wider">
                  Product Gallery Images ({imageUrls.length})
                </label>
                <p className="text-xs text-slate-500 font-medium">
                  Add as many images as you want. The 1st image is the main store cover.
                </p>
              </div>
              {imageUrls.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-5 bg-gradient-to-br from-pink-50/50 to-amber-50/30 border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-3xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer hover:bg-pink-50/70 select-none">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-pink-500" />
                </div>
                <span className="text-xs font-black text-slate-800 group-hover:text-pink-600 block">
                  {uploadingImage ? 'Uploading Images...' : 'Click to Upload Multiple Images'}
                </span>
                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                  Select multiple PNG, JPG, WEBP from your device (No limit)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between space-y-2">
                <label className="text-xs font-black text-slate-800">
                  Paste Image URL(s):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... (paste single or comma-separated URLs)"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setPreviewUrlError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl(e);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Instant Live URL Preview (Shows immediately without backend server) */}
                {newImageUrl.trim().length > 8 && (
                  <div className="p-2.5 bg-white border border-pink-200 rounded-2xl flex items-center gap-3 shadow-xs transition-all">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative">
                      {!previewUrlError ? (
                        <img
                          src={newImageUrl.trim()}
                          alt="Live URL Preview"
                          className="w-full h-full object-cover"
                          onLoad={() => setPreviewUrlError(false)}
                          onError={() => setPreviewUrlError(true)}
                        />
                      ) : (
                        <div className="p-1 text-center">
                          <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                          <span className="text-[8px] text-rose-500 font-bold block leading-tight mt-0.5">Broken Link</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {!previewUrlError ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Instant Image Preview Ready
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Image failed to load
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {newImageUrl.trim()}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          + Add to Product
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewImageUrl('');
                            setPreviewUrlError(false);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  Tip: Press Enter or click Add to add multiple URLs. Stored directly to MongoDB!
                </p>
              </div>
            </div>



            {/* Image Preview Grid - Shows ALL images */}
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                {imageUrls.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group bg-slate-100 shadow-xs ${
                      idx === 0 ? 'border-pink-500 ring-2 ring-pink-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Toy preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                      }}
                    />

                    {/* Image index / Cover Badge */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                      {idx === 0 ? (
                        <span className="px-1.5 py-0.5 bg-pink-500 text-white text-[9px] font-black rounded-md shadow-xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Cover
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded-md backdrop-blur-xs">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2 z-20">
                      <div className="w-full flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                          title="Delete image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-full flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAsCoverImage(idx)}
                            className="px-2 py-0.5 bg-white text-slate-900 text-[10px] font-black rounded-md shadow-xs hover:bg-pink-50 hover:text-pink-600 transition-colors"
                            title="Set as Main Cover Image"
                          >
                            Set Cover
                          </button>
                        )}
                      </div>

                      {/* Reorder Left / Right */}
                      <div className="w-full flex items-center justify-between text-[10px] text-white font-bold">
                        {idx > 0 ? (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            className="px-1.5 py-0.5 bg-slate-800/80 rounded hover:bg-slate-700"
                            title="Move left"
                          >
                            ◀
                          </button>
                        ) : (
                          <div />
                        )}
                        {idx < imageUrls.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            className="px-1.5 py-0.5 bg-slate-800/80 rounded hover:bg-slate-700"
                            title="Move right"
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-pink-50/60 to-purple-50/60 border border-dashed border-pink-300 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-pink-200 p-2 shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png"
                    alt="Toy World Default Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Default Product Image: Toy World Logo
                    </span>
                    <span className="text-[10px] bg-pink-100 text-pink-700 font-black px-2 py-0.5 rounded-full">
                      Auto Default
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No image uploaded yet. If you save without adding an image, our official store logo will automatically be used as the product image!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-pink-500 rounded-sm border-slate-300 focus:ring-pink-400"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Featured on Homepage Showcase
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/admin/products"
              className="px-6 py-3 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md shadow-pink-200 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Updated Toy Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

