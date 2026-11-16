import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters from URL or defaults
  const keyword = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const featuredOnly = searchParams.get('featured') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Local search input
  const [searchInput, setSearchInput] = useState(keyword);

  // Load Categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 12,
          keyword,
          category: selectedCategory,
          sort: sortBy,
          featured: featuredOnly ? 'true' : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        };

        const { data } = await api.get('/products', { params });
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (err) {
        console.error('Error fetching products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    keyword,
    selectedCategory,
    sortBy,
    featuredOnly,
    minPrice,
    maxPrice,
    currentPage,
  ]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.delete('page'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    keyword,
    selectedCategory !== 'all' ? selectedCategory : '',
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 font-heading">
          Explore All Toys 🧸
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Showing {totalProducts} whimsical toys ready for adventure
        </p>
      </div>

      {/* Mobile Filters button & Sort Dropdown bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => updateParam('featured', featuredOnly ? '' : 'true')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              featuredOnly
                ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            <span>Featured Toys</span>
          </button>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-pink-500" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="sort" className="text-xs font-bold text-slate-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-3.5 py-2 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
          >
            <option value="featured">⭐ Featured First</option>
            <option value="newest">✨ Newest Arrivals</option>
            <option value="popular">🔥 Most Popular</option>
            <option value="rating">⭐ Top Rated</option>
            <option value="price-low">💰 Price: Low to High</option>
            <option value="price-high">💎 Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs h-fit sticky top-28">
          {/* Keyword Search */}
          <div>
            <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider mb-2.5">
              Search Toys
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search toys by name..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParam('search', '');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider mb-2.5">
              Category
            </h3>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => updateParam('category', c._id)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedCategory === c._id || selectedCategory === c.name
                      ? 'bg-pink-100 text-pink-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">
                    {c.icon} {c.name}
                  </span>
                  {c.productCount !== undefined && (
                    <span className="text-[10px] text-slate-400">{c.productCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider mb-2.5">
              Price Range (₹)
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-1/2 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
              <span className="text-xs text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-1/2 p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="lg:col-span-3">
          {loading ? (
            <Loader text="Unwrapping the freshest toys..." />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-black text-slate-800 font-heading">
                No matching toys found!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search query or adjusting your price or category filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-200 hover:bg-pink-600"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => updateParam('page', currentPage - 1)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                        currentPage === p
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => updateParam('page', currentPage + 1)}
                    className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-base font-black text-slate-900 font-heading">Toy Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Category</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    updateParam('category', 'all');
                    setMobileFiltersOpen(false);
                  }}
                  className="w-full text-left py-1 text-xs font-bold text-pink-600"
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      updateParam('category', c._id);
                      setMobileFiltersOpen(false);
                    }}
                    className="w-full text-left py-1 text-xs text-slate-600 hover:text-pink-600 block truncate"
                  >
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setMobileFiltersOpen(false);
              }}
              className="w-full py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

