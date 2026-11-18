import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  PackageCheck,
  LayoutDashboard,
  LogOut,
  Home as HomeIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toyLogo from '../../assets/logo.png';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Automatically close profile dropdown & mobile menu when navigating to another page
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Immediately close profile dropdown when scrolling down the page or clicking outside
  useEffect(() => {
    if (!profileDropdownOpen) return;

    const handleScroll = () => {
      setProfileDropdownOpen(false);
    };

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Toys', path: '/shop' },
    { name: 'Best Sellers', path: '/shop?sort=popular' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-[#FF6B9A] to-[#A855F7] backdrop-blur-md border-b border-white/20 shadow-md transition-all">
      {/* Top Subtle Shimmer Highlight Ribbon */}
      <div className="h-0.5 bg-gradient-to-r from-white/30 via-white/80 to-white/30 w-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group py-1">
            <img
              src={toyLogo}
              alt="Toy World - Play Learn Grow"
              className="h-11 sm:h-16 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 select-none"
            />
          </Link>

          {/* Desktop Nav Links Pill Container */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-white/15 backdrop-blur-md p-1.5 rounded-full border border-white/25 shadow-inner">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `font-nav text-[15px] lg:text-[16px] font-bold px-4 py-1.5 rounded-full tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#A855F7] font-extrabold shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/20'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-all shadow-2xs hover:scale-105 active:scale-95"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 fill-white/20 text-white" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-slate-900 text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#A855F7] hover:bg-white/95 font-extrabold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#A855F7]" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-gradient-to-r from-[#FF6B9A] to-[#A855F7] text-white px-2 py-0.5 rounded-full text-xs font-black min-w-[20px] text-center shadow-2xs">
                {totalItems}
              </span>
            </Link>

            {/* User Dropdown / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 hover:bg-white/25 transition-all cursor-pointer text-white shadow-2xs hover:scale-105 active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white max-w-[120px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-xs text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="truncate flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="mt-1 inline-block px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md uppercase">
                              Admin Account
                            </span>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Portal
                        </Link>
                      )}

                      <Link
                        to="/my-orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <PackageCheck className="w-4 h-4" /> My Orders
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Profile & Addresses
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-100 mt-1 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 bg-white text-[#A855F7] hover:bg-white/95 rounded-full text-xs font-extrabold shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/20 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Directly Visible Mobile Navigation Bar for "Home", "Shop All Toys", "Best Sellers" */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2 border-t border-white/20 bg-white/10 backdrop-blur-md overflow-x-auto scrollbar-none">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 shadow-2xs ${
                isActive
                  ? 'bg-white text-[#A855F7] font-black shadow-sm scale-102'
                  : 'text-white/95 bg-white/20 hover:bg-white/30'
              }`
            }
          >
            {link.name === 'Home' && '🏠'}
            {(link.name === 'Our Toys' || link.name === 'Our Toy' || link.name === 'Shop All Toys') && '🧸'}
            {link.name === 'Best Sellers' && '⭐'}
            {link.name === 'About Us' && '✨'}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Mobile Drawer Navigation: Smooth slide-in mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
            />

            {/* Smooth Slide-In Mobile Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[320px] bg-gradient-to-b from-[#FF6B9A] via-[#A855F7] to-[#8B5CF6] z-50 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden text-white"
            >
              <div className="space-y-5">
                {/* Drawer Header with Logo & Close Button */}
                <div className="flex items-center justify-between pb-3 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <img
                      src={toyLogo}
                      alt="Toy World"
                      className="h-10 w-auto object-contain drop-shadow-sm select-none"
                    />
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* User Card if Authenticated */}
                {isAuthenticated && (
                  <div className="bg-white/15 p-3 rounded-2xl flex items-center gap-3 border border-white/25">
                    <div className="w-10 h-10 rounded-full bg-white/25 text-white font-bold flex items-center justify-center text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-white/80 truncate">{user?.email}</p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <div className="flex flex-col space-y-1.5 font-heading">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `min-h-[44px] flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-base font-bold transition-all ${
                          isActive
                            ? 'bg-white text-[#A855F7] shadow-sm font-black'
                            : 'text-white/95 hover:bg-white/15'
                        }`
                      }
                    >
                      {link.name === 'Home' && <HomeIcon className="w-5 h-5" />}
                      {(link.name === 'Our Toys' || link.name === 'Our Toy' || link.name === 'Shop All Toys') && <ShoppingBag className="w-5 h-5" />}
                      {link.name === 'Best Sellers' && <PackageCheck className="w-5 h-5" />}
                      {link.name === 'About Us' && <Sparkles className="w-5 h-5" />}
                      <span>{link.name}</span>
                    </NavLink>
                  ))}

                  <NavLink
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] py-2.5 px-3.5 rounded-xl text-white/95 hover:bg-white/15 transition-colors flex items-center justify-between text-base font-bold"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-5 h-5" /> My Wishlist
                    </span>
                    <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 rounded-full text-xs font-bold">
                      {wishlist.length}
                    </span>
                  </NavLink>

                  <NavLink
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] py-2.5 px-3.5 rounded-xl text-white/95 hover:bg-white/15 transition-colors flex items-center justify-between text-base font-bold"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5" /> Shopping Cart
                    </span>
                    <span className="px-2 py-0.5 bg-white text-[#A855F7] rounded-full text-xs font-black">
                      {totalItems}
                    </span>
                  </NavLink>

                  {isAuthenticated && (
                    <>
                      <NavLink
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-[44px] py-2.5 px-3.5 rounded-xl text-white/95 hover:bg-white/15 transition-colors flex items-center gap-3 text-base font-bold"
                      >
                        <PackageCheck className="w-5 h-5" />
                        <span>My Orders</span>
                      </NavLink>
                      <NavLink
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-[44px] py-2.5 px-3.5 rounded-xl text-white/95 hover:bg-white/15 transition-colors flex items-center gap-3 text-base font-bold"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>Profile & Addresses</span>
                      </NavLink>
                    </>
                  )}

                  {isAdmin && (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] py-2.5 px-3.5 rounded-xl text-yellow-300 font-bold flex items-center gap-3 hover:bg-white/15 text-base"
                    >
                      <LayoutDashboard className="w-5 h-5" /> Admin Portal
                    </NavLink>
                  )}
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-white/20 mt-6 space-y-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full min-h-[44px] py-2.5 text-center text-sm font-bold text-white border border-white/40 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full min-h-[44px] py-2.5 text-center text-sm font-extrabold text-[#A855F7] bg-white rounded-full shadow-md flex items-center justify-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>

    {/* Spacer to prevent page content from being hidden behind fixed navbar */}
    <div className="h-[108px] md:h-20 w-full flex-shrink-0" aria-hidden="true" />
  </>
  );
};

export default Navbar;
