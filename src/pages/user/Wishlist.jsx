import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-500 mx-auto flex items-center justify-center text-4xl">
          💖
        </div>
        <h2 className="text-3xl font-black text-slate-900 font-heading">
          Your Saved Toy Collection
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please log in to see the toys you've saved to your wishlist.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md shadow-pink-200"
          >
            Log In
          </Link>
          <Link
            to="/shop"
            className="px-8 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-sm"
          >
            Browse Toys
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Gathering your favorite toys..." />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-rose-50 text-rose-400 mx-auto flex items-center justify-center text-5xl">
          🧸
        </div>
        <h2 className="text-3xl font-black text-slate-900 font-heading">
          Your Wishlist is Empty
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Tap the heart icon on any toy you love to save it here for birthdays, holidays, or upcoming surprises!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black text-sm shadow-lg shadow-pink-200 transition-all active:scale-95"
        >
          <span>Discover Awesome Toys</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 font-heading flex items-center gap-2">
          Saved Wishlist <Heart className="w-7 h-7 text-rose-500 fill-current" />
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {wishlist.length} toy{wishlist.length > 1 ? 's' : ''} saved for later
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {wishlist.map((product) => {
          if (!product) return null;
          const originalPrice = product.price;
          const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

          return (
            <div
              key={product._id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col p-2.5 sm:p-4 relative"
            >
              {/* Remove button */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 sm:top-6 sm:right-6 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-rose-50 text-slate-400 hover:text-rose-500 shadow-xs transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Image */}
              <Link
                to={`/product/${product._id}`}
                className="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3"
              >
                <img
                  src={
                    product.productImages?.[0] ||
                    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <Link
                    to={`/product/${product._id}`}
                    className="block text-sm font-bold text-slate-900 hover:text-pink-600 truncate font-heading"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-slate-400">Age: {product.ageGroup}</p>
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-sm sm:text-lg font-black text-slate-900 font-heading">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {product.discountPrice > 0 && (
                    <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <button
                  disabled={product.stockQuantity <= 0}
                  onClick={() => addToCart(product, 1)}
                  className="w-full py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{product.stockQuantity > 0 ? 'Move to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

