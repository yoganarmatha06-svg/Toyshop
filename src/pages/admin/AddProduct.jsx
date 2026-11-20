import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Plus,
  X,
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { cleanImageUrl, parseImageUrls, resolveProductImageUrl } from '../../utils/imageUrlHelper';

const AddProduct = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
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
  const [stockQuantity, setStockQuantity] = useState('15');
  const [isFeatured, setIsFeatured] = useState(true);

  // Images list (supports uploaded URLs or manual image links)
  const [imageUrls, setImageUrls] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const { data } = await api.get('/categories');
        setCategories(data || []);
        if (data && data.length > 0) {
          setCategory(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    if (!newImageUrl.trim()) return;

    const urls = parseImageUrls(newImageUrl);

    if (urls.length > 0) {
      setImageUrls((prev) => [...prev, ...urls]);
      setNewImageUrl('');
      setPreviewUrlError(false);
      addToast(`${urls.length} image(s) added! 🖼️`, 'success');
    } else {
      addToast('Please enter a valid image URL', 'error');
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
      const extraUrls = parseImageUrls(newImageUrl);
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
        ageGroup: '3-5 Years',
        stockQuantity: stockQuantity !== '' ? Number(stockQuantity) : 10,
        productImages: finalImages,
        isFeatured,
      };

      await api.post('/products', payload);
      addToast('New toy added to inventory successfully! 🎉', 'success');
      navigate('/admin/products');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
          New Product Entry
        </span>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-10 border border-slate-200 shadow-xs space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Add New Toy Listing 🧸
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Fill in toy details, pricing, stock, and multiple images
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toy Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Toy Name *</label>
            <input
              type="text"
              placeholder="e.g. LEGO Technic Rescue Helicopter Kit (600 Pcs)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Toy Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows="4"
              placeholder="Detailed description of features, play modes, educational benefits, and materials (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Category & Brand Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brand <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lego, Mattel, Hot Wheels..."
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Price, Discount Price, Stock Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price (₹) <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Type price (e.g. 1999)"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setPrice(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discount Price (₹) <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Type discount price (e.g. 1599)"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Stock Quantity <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Type stock (e.g. 15)"
                value={stockQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*$/.test(val)) {
                    setStockQuantity(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Multiple Images Management */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-black text-slate-900 font-heading uppercase tracking-wider">
                  Product Gallery Images ({imageUrls.length})
                </label>
                <p className="text-xs text-slate-500 font-medium">
                  Add as many images as you want (no limit). The 1st image is the main store cover.
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

            {/* Upload File Input & URL Input */}
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
                {(() => {
                  const cleanedPreview = cleanImageUrl(newImageUrl);
                  if (cleanedPreview.length > 8) {
                    return (
                      <div className="p-2.5 bg-white border border-pink-200 rounded-2xl flex items-center gap-3 shadow-xs transition-all">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center relative">
                          {!previewUrlError ? (
                            <img
                              src={cleanedPreview}
                              alt="Live URL Preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onLoad={() => setPreviewUrlError(false)}
                              onError={() => setPreviewUrlError(true)}
                            />
                          ) : (
                            <div className="p-1 text-center">
                              <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                              <span className="text-[8px] text-rose-500 font-bold block leading-tight mt-0.5">
                                Broken Link
                              </span>
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
                            {cleanedPreview}
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
                    );
                  }
                  return null;
                })()}

                <p className="text-[10px] text-slate-400">
                  Tip: Press Enter or click Add to add image URL. Supports Google, Unsplash, Amazon & CDN links!
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
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
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

          {/* Featured Checkbox & Live Store Preview Notice */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <input
                type="checkbox"
                id="isFeaturedProduct"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-pink-500 rounded-md border-amber-300 focus:ring-pink-400 cursor-pointer"
              />
              <label htmlFor="isFeaturedProduct" className="cursor-pointer">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Feature this toy on Homepage & Top of Shop Catalog
                </span>
                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                  When checked, this toy immediately appears at the top of the Home Page Featured Showcase and Shop Catalog as soon as it is published!
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <Link
              to="/admin/products"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 text-center min-h-[44px] flex items-center justify-center transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md shadow-pink-200 active:scale-95 disabled:opacity-50 transition-all min-h-[44px] flex items-center justify-center"
            >
              {submitting ? 'Saving Toy...' : 'Publish Toy to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;

