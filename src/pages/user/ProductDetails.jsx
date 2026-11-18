import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Award,
  Check,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data: prodData } = await api.get(`/products/${id}`);
        setProduct(prodData);
        setSelectedImage(0);
        setQuantity(1);

        // Fetch reviews & related products in parallel
        const [revRes, relRes] = await Promise.all([
          api.get(`/reviews/product/${id}`),
          api.get('/products', {
            params: {
              category: prodData.category?._id || prodData.category,
              limit: 4,
            },
          }),
        ]);

        setReviews(revRes.data || []);
        setRelatedProducts(
          (relRes.data?.products || []).filter((p) => p._id !== prodData._id)
        );
      } catch (err) {
        console.error('Error fetching toy details:', err.message);
        addToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please log in to submit a review!', 'info');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Please write a comment for your review', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const { data } = await api.post(`/reviews/product/${id}`, {
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      addToast(data.message || 'Review submitted successfully! ⭐', 'success');
      setReviewTitle('');
      setReviewComment('');

      // Refresh reviews & product stats
      const [revRes, prodRes] = await Promise.all([
        api.get(`/reviews/product/${id}`),
        api.get(`/products/${id}`),
      ]);
      setReviews(revRes.data || []);
      setProduct(prodRes.data);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Unboxing this wonderful toy..." />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 font-heading mb-4">Toy Not Found</h2>
        <Link to="/shop" className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-bold text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;
  const hasDiscount = product.discountPrice > 0 && !product.isFeatured;
  const originalPrice = product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent =
    hasDiscount
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap py-1 scrollbar-none">
        <Link to="/" className="hover:text-pink-600 flex-shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link to="/shop" className="hover:text-pink-600 flex-shrink-0">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category._id || product.category}`} className="hover:text-pink-600 flex-shrink-0">
              {product.category.name || 'Category'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          </>
        )}
        <span className="text-slate-900 font-bold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-md">
            <img
              src={
                product.productImages?.[selectedImage] ||
                product.productImages?.[0] ||
                '/logo.png'
              }
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1.5 bg-rose-500 text-white font-black text-xs rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.productImages && product.productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === idx
                      ? 'border-pink-500 shadow-md ring-2 ring-pink-200'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-700 font-black text-xs rounded-full uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                Age: {product.ageGroup}
              </span>
            </div>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-full border transition-all active:scale-90 ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading leading-tight">
            {product.name}
          </h1>

          {/* Rating overview */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating || 5)
                      ? 'fill-current text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-slate-800">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
            <span className="text-slate-400 font-medium">({product.numReviews} customer reviews)</span>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-3xl bg-pink-50/50 border border-pink-100/60 flex items-baseline gap-4">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && product.discountPrice > 0 && (
              <span className="text-lg text-slate-400 line-through font-semibold">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {hasDiscount && discountPercent > 0 && (
              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                You Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}!
              </span>
            )}
          </div>

          {/* Stock availability */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">Availability:</span>
            {product.stockQuantity > 5 ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> In Stock ({product.stockQuantity} units available)
              </span>
            ) : product.stockQuantity > 0 ? (
              <span className="text-amber-600">
                Hurry! Only {product.stockQuantity} remaining in stock!
              </span>
            ) : (
              <span className="text-rose-600">Currently Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-slate-600 leading-relaxed pt-2">
            <p>{product.description}</p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-full bg-white p-1">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 active:scale-95 transition-all text-base"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-base text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 active:scale-95 transition-all text-base"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => addToCart(product, quantity)}
                className="flex-1 min-h-[48px] py-3.5 sm:py-4 px-6 sm:px-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg shadow-pink-300/40 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="min-h-[48px] py-3.5 sm:py-4 px-5 sm:px-6 rounded-full border-2 border-slate-200 hover:border-pink-300 text-slate-700 font-bold text-sm bg-white hover:bg-pink-50/50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isLiked ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-pink-500" />
              <span>Free Delivery Above ₹999</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Certified Safe Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-sky-500" />
              <span>7 Days Free Return Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-8">
        <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-heading">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-500">Real feedback from caring parents and toy collectors</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-amber-500 font-heading">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </div>
            <div className="text-xs">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-slate-400">Average Rating</span>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80">
          <h4 className="text-sm font-bold text-slate-800 font-heading mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-pink-500" /> Write a Review for this Toy
          </h4>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Your Rating:</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-amber-600">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Review Headline (optional):</label>
                <input
                  type="text"
                  placeholder="e.g. My child plays with this every single day!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Your Experience & Feedback *:</label>
                <textarea
                  rows="3"
                  placeholder="Describe toy quality, durability, child reactions, or learning value..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Customer Review'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-xs text-slate-500 mb-2">Please log in to share your experience with this toy.</p>
              <Link to="/login" className="px-5 py-2 bg-pink-500 text-white text-xs font-bold rounded-full inline-block">
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              No reviews yet. Be the first to share your thoughts on this toy! 🌟
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={rev.user?.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rev.user?.name || 'Verified Customer'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h5 className="text-xs font-bold text-slate-900 font-heading">{rev.title}</h5>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 font-heading">
            You May Also Love
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;

