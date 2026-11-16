import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const SearchBar = ({ initialQuery = '', onSearch, placeholder = 'Search toys by name, brand, or skill...' }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    } else {
      if (query.trim()) {
        navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      } else {
        navigate('/shop');
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-pink-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white/95 text-slate-800 placeholder-slate-400 rounded-full border border-pink-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm font-medium"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-bold rounded-full hover:shadow-md hover:brightness-105 active:scale-95 transition-all"
        >
          Find
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

