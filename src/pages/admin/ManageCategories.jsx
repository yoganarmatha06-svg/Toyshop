import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, X, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader/Loader';
import { getCategoryImage } from '../../utils/categoryAssets';

const ManageCategories = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🧸');
  const [color, setColor] = useState('#FEE2E2');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('🧸');
    setColor('#FEE2E2');
    setImage('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || '🧸');
    setColor(cat.color || '#FEE2E2');
    setImage(cat.image || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = { name, description, icon, color, image };

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
      addToast(err.message, 'error');
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
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Toy Product Categories 📂
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage the 10 core toy divisions, icons, colors, and descriptions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 flex items-center gap-2 self-start sm:self-auto active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {loading ? (
        <Loader text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const catImg = getCategoryImage(cat);
            return (
              <div
                key={cat._id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-xs relative"
                      style={{
                        backgroundColor: catImg ? '#FFFFFF' : (cat.color || '#FEE2E2'),
                      }}
                    >
                      {catImg ? (
                        <img
                          src={catImg.src}
                          alt={cat.name}
                          className={`w-full h-full ${catImg.fit === 'contain' ? 'object-contain p-1' : 'object-cover'} rounded-2xl select-none`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      ) : (
                        <span className="text-2xl select-none">{cat.icon || '🧸'}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-500 px-2.5 py-1 bg-slate-100/80 rounded-full border border-slate-200/60">
                      {cat.productCount || 0} toys
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-heading mb-1">{cat.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-600 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 z-10">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-black text-slate-900 font-heading">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Remote Control Toys"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🧸"
                    className="w-full px-3 py-2 text-center text-lg bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Theme Pastel Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Short tagline about toys in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Image Preview in Modal */}
              {(() => {
                const previewImg = getCategoryImage({
                  name,
                  slug: editingCategory?.slug,
                  image,
                });
                if (previewImg) {
                  return (
                    <div className="flex items-center gap-3 p-3 bg-pink-50/70 border border-pink-100 rounded-2xl">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-pink-200 shrink-0 flex items-center justify-center shadow-xs">
                        <img
                          src={previewImg.src}
                          alt="Category preview"
                          className={`w-full h-full ${previewImg.fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Category Card Image</p>
                        <p className="text-[11px] text-pink-600 font-medium">
                          Active image displayed on Explore Categories
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-full shadow-sm disabled:opacity-50"
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
