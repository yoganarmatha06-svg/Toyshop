import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

/**
 * Premium 3D Image Tilt Component specifically for Featured Toys.
 * Dynamically calculates rotateX and rotateY transformations based on mouse position,
 * adds scale(1.05) zoom, specular light sheen, and realistic depth shadow.
 * On mobile/touch devices, mouse tilt is automatically disabled.
 */
const FeaturedTiltImage = ({ product, isOutOfStock }) => {
  const containerRef = useRef(null);
  const tiltCardRef = useRef(null);
  const glareRef = useRef(null);
  const isHoveredRef = useRef(false);
  const rafId = useRef(null);

  const handleMouseEnter = () => {
    // Disable on touch / mobile devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    isHoveredRef.current = true;
    if (tiltCardRef.current) {
      tiltCardRef.current.style.transition = 'transform 0.25s ease-out, box-shadow 0.25s ease-out';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseMove = (e) => {
    if (!isHoveredRef.current || !containerRef.current || !tiltCardRef.current) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX; // -1 (left) to 1 (right)
    const deltaY = (y - centerY) / centerY; // -1 (top) to 1 (bottom)

    // Smooth & natural 3D tilt angles (max 10 degrees)
    const maxTilt = 10;
    const rotateX = (-deltaY * maxTilt).toFixed(2);
    const rotateY = (deltaX * maxTilt).toFixed(2);

    // Dynamic specular glare position
    const glareX = ((x / rect.width) * 100).toFixed(1);
    const glareY = ((y / rect.height) * 100).toFixed(1);

    // Subtle 3D depth shadow shifting with angle (purple & pink palette)
    const shadowX = (-deltaX * 8).toFixed(1);
    const shadowY = (-deltaY * 8 + 8).toFixed(1);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!tiltCardRef.current) return;
      tiltCardRef.current.style.transition = 'transform 0.08s ease-out, box-shadow 0.12s ease-out';
      tiltCardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      tiltCardRef.current.style.boxShadow = `${shadowX}px ${shadowY}px 22px -4px rgba(168, 85, 247, 0.25), 0 8px 16px -4px rgba(236, 72, 153, 0.18)`;

      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 75%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    if (tiltCardRef.current) {
      // Smooth reset transition (500ms) with natural cubic bezier curve
      tiltCardRef.current.style.transition =
        'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease-out';
      tiltCardRef.current.style.transform =
        'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      tiltCardRef.current.style.boxShadow = 'none';
    }

    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <Link
      to={`/product/${product._id}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative block aspect-square overflow-hidden rounded-t-3xl bg-slate-50 [perspective:800px] focus:outline-none"
    >
      <div
        ref={tiltCardRef}
        className="w-full h-full relative [transform-style:preserve-3d] will-change-transform rounded-t-3xl overflow-hidden"
        style={{
          transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        }}
      >
        <img
          src={
            product.productImages?.[0] ||
            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover object-center select-none"
          loading="lazy"
        />

        {/* Dynamic Specular Glare Overlay for realistic 3D depth */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 z-10"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0) 70%)',
          }}
        />

        {/* Subtle border overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-t-3xl border border-black/5 z-10"
          aria-hidden="true"
        />
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-20">
          <span className="px-4 py-1.5 bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg">
            Out of Stock
          </span>
        </div>
      )}
    </Link>
  );
};

/**
 * Inner content of the ProductCard (Image, Badges, Details, Actions)
 */
const ProductCardInner = ({
  product,
  isFeaturedSection,
  discountPercent,
  originalPrice,
  currentPrice,
  isOutOfStock,
  isLiked,
  handleToggleWishlist,
  handleAddToCart,
}) => (
  <>
    {/* Top Badges (Discount & Featured) */}
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
      {discountPercent > 0 && (
        <span className="px-2.5 py-1 text-xs font-black bg-rose-500 text-white rounded-full shadow-sm">
          {discountPercent}% OFF
        </span>
      )}
      {product.isFeatured && (
        <span className="px-2.5 py-1 text-xs font-bold bg-amber-400 text-amber-950 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-current text-amber-950" /> Featured
        </span>
      )}
    </div>

    {/* Wishlist Heart Button */}
    <button
      onClick={handleToggleWishlist}
      aria-label="Wishlist"
      className={`absolute top-3 right-3 z-30 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer ${
        isLiked
          ? 'bg-rose-50 text-rose-500 shadow-md ring-2 ring-rose-200'
          : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
    </button>

    {/* Product Image Link (Interactive 3D Tilt exclusively on Featured Toys, standard zoom on others) */}
    {isFeaturedSection ? (
      <FeaturedTiltImage product={product} isOutOfStock={isOutOfStock} />
    ) : (
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-square overflow-hidden rounded-t-3xl bg-slate-50 focus:outline-none"
      >
        <img
          src={
            product.productImages?.[0] ||
            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out select-none"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-4 py-1.5 bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
    )}

    {/* Product Details */}
    <div className="p-4 flex flex-col flex-1 bg-white rounded-b-3xl">
      {/* Category & Age Group */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
        <span className="truncate max-w-[130px] font-bold text-pink-700">
          {product.category?.name || product.brand}
        </span>
        {product.ageGroup && (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md font-bold text-[11px]">
            {product.ageGroup}
          </span>
        )}
      </div>

      {/* Product Title */}
      <Link
        to={`/product/${product._id}`}
        className="text-sm font-bold text-slate-800 group-hover:text-pink-600 line-clamp-2 transition-colors duration-300 font-heading mb-2 leading-snug"
        title={product.name}
      >
        {product.name}
      </Link>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-3 text-xs">
        <div className="flex items-center text-amber-400">
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
        <span className="font-bold text-slate-700">
          {product.rating ? product.rating.toFixed(1) : 'New'}
        </span>
        {product.numReviews > 0 && (
          <span className="text-slate-400">({product.numReviews})</span>
        )}
      </div>

      {/* Price & Add to Cart button */}
      <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-slate-900 font-heading">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {product.discountPrice > 0 && (
              <span className="text-xs text-slate-600 line-through font-semibold">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-[10px] text-emerald-800 font-bold">
            {product.stockQuantity > 5
              ? 'In Stock'
              : product.stockQuantity > 0
              ? `Only ${product.stockQuantity} left!`
              : 'Unavailable'}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`p-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-200 hover:shadow-lg hover:shadow-pink-300 active:scale-95'
          }`}
          title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  </>
);

const ProductCard = ({ product, isFeaturedSection = false }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;

  const originalPrice = product.price;
  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent =
    product.discountPrice > 0
      ? Math.round(((originalPrice - product.discountPrice) / originalPrice) * 100)
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const sharedProps = {
    product,
    isFeaturedSection,
    discountPercent,
    originalPrice,
    currentPrice,
    isOutOfStock,
    isLiked,
    handleToggleWishlist,
    handleAddToCart,
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-pink-200 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
      <ProductCardInner {...sharedProps} />
    </div>
  );
};

export default ProductCard;
