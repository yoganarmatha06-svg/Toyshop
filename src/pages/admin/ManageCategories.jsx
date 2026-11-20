import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import { getCategoryImage, resolveCategoryImageUrl } from '../../utils/categoryAssets';

const ManageCategories = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#FEE2E2');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const nameMatch = cat.name?.toLowerCase().includes(term);
    const descMatch = cat.description?.toLowerCase().includes(term);
    return nameMatch || descMatch;
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor('#FEE2E2');
    setImage('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setColor(cat.color || '#FEE2E2');
    setImage(cat.image || '');
    setModalOpen(true);
  };

  // Handle local file upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp|svg\+xml)/)) {
      addToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const { data } = await api.post('/categories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.imageUrl) {
        setImage(data.imageUrl);
        addToast(
          data.storage === 'cloudinary'
            ? 'Category image uploaded to Cloudinary! ☁️'
            : 'Category image uploaded successfully! 📸',
          'success'
        );
      }
    } catch (err) {
      console.warn('Backend category upload failed, using high-res local image reading fallback...', err);
      // Fallback: convert file to Base64 Data URL so image is NEVER lost
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
          addToast('Image loaded successfully! (Saved as image data)', 'success');
        };
        reader.onerror = () => {
          addToast('Failed to read image file', 'error');
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        addToast(err.message || 'Failed to upload image', 'error');
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addToast('Category image removed. Click Save to apply.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        color,
        image: image.trim(),
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        addToast('Category updated successfully! ✨', 'success');
      } else {
        await api.post('/categories', payload);
        addToast('New category added! 🎉', 'success');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      addToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Toy Product Categories 📂
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage category images, names, colors, and descriptions dynamically stored in MongoDB
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto justify-center min-h-[44px] px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium text-slate-800 transition-all min-h-[42px]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-slate-500">
          <span className="px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200/60 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-pink-500" />
            {searchTerm.trim() ? (
              <>
                Found: <strong className="text-slate-900">{filteredCategories.length}</strong> of {categories.length} categories
              </>
            ) : (
              <>
                Total: <strong className="text-slate-900">{categories.length}</strong> categories
              </>
            )}
          </span>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading categories..." />
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No categories found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm.trim()
              ? `No category matching "${searchTerm}" was found.`
              : 'No categories exist yet. Click "+ Add New Category" to create one.'}
          </p>
          {searchTerm.trim() && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredCategories.map((cat) => {
            const hasImg = Boolean(cat.image && cat.image.trim());
            const catImg = getCategoryImage(cat);

            return (
              <div
                key={cat._id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  {/* Category Image Box */}
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-3 group/img">
                    <img
                      src={catImg.src}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 select-none"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <span className="absolute top-2 right-2 text-[10px] font-extrabold text-slate-700 px-2 py-0.5 bg-white/90 backdrop-blur-xs rounded-full border border-slate-200 shadow-xs">
                      {cat.productCount || 0} toys
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-heading mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasImg
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {hasImg ? 'Custom Image' : 'Default Image'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-slate-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-md w-full shadow-2xl space-y-4 sm:space-y-5 z-10 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 font-heading">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Image Profile-Style Preview & Upload Section */}
              <div className="p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="text-center">
                  <label className="block text-xs font-bold text-slate-700">Category Image</label>
                  <p className="text-[11px] text-slate-400">
                    Upload from computer or paste an external image link
                  </p>
                </div>

                {/* Profile-Picture-Style Live Image Preview */}
                <div className="flex justify-center">
                  <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-md ring-2 ring-pink-200 flex items-center justify-center">
                    {image ? (
                      <img
                        src={resolveCategoryImageUrl(image)}
                        alt={name || 'Category Preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-10 h-10 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400">No Image</span>
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1.5 backdrop-blur-xs">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload & Remove Image Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-3.5 py-2 min-h-[38px] rounded-full text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-xs inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {image ? 'Change Image' : 'Upload Image'}
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="px-3.5 py-2 min-h-[38px] rounded-full text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 inline-flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Image URL Input Option */}
                <div className="pt-2 border-t border-slate-200/70">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Or Image URL:
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/toy-image.jpg"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 font-medium text-slate-800 pr-8 min-h-[38px]"
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Clear URL"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Remote Control Toys"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 font-medium text-slate-800 min-h-[42px]"
                  required
                />
              </div>

              {/* Theme Pastel Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Theme Pastel Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-11 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Short tagline about toys in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 font-medium text-slate-800 min-h-[64px]"
                />
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto min-h-[42px] px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer flex items-center justify-center rounded-xl sm:rounded-full bg-slate-100 sm:bg-transparent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-full shadow-sm disabled:opacity-50 cursor-pointer active:scale-95 transition-all flex items-center justify-center"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
