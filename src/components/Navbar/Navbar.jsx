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
    { name: 'Shop All Toys', path: '/shop' },
    { name: 'Best Sellers', path: '/shop?sort=popular' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#FF6B9A] to-[#A855F7] backdrop-blur-md border-b border-white/20 shadow-md transition-all">
      {/* Top Subtle Shimmer Highlight Ribbon */}
      <div className="h-0.5 bg-gradient-to-r from-white/30 via-white/80 to-white/30 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 group py-1">
            <img
              src={toyLogo}
              alt="Toy World - Play Learn Grow"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300 select-none"
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
                  {user?.avatar && user.avatar.trim() !== '' && !user.avatar.includes('photo-1534528741775-53994a69daeb') && (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white/70 flex-shrink-0"
                    />
                  )}
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
                        {user?.avatar && user.avatar.trim() !== '' && !user.avatar.includes('photo-1534528741775-53994a69daeb') ? (
                          <img
                            src={user.avatar}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-400 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-xs text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
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

      {/* Mobile Drawer Navigation with matching gradient */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gradient-to-b from-[#FF6B9A] to-[#A855F7] border-t border-white/20 px-6 py-6 shadow-xl space-y-4"
          >
            <div className="flex flex-col space-y-3 font-heading font-semibold text-base">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `py-2.5 px-3 rounded-xl font-nav text-lg font-bold transition-colors ${
                      isActive ? 'bg-white text-[#A855F7] shadow-sm' : 'text-white/90 hover:bg-white/15'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <NavLink
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-white/90 hover:bg-white/15 transition-colors flex items-center justify-between"
              >
                <span>My Wishlist</span>
                <span className="px-2 py-0.5 bg-yellow-400 text-slate-900 rounded-full text-xs font-bold">
                  {wishlist.length}
                </span>
              </NavLink>
              {isAuthenticated && (
                <>
                  <NavLink
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-white/90 hover:bg-white/15 transition-colors flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>My Orders</span>
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-white/90 hover:bg-white/15 transition-colors flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl text-yellow-300 font-bold flex items-center gap-2 hover:bg-white/15"
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Portal
                </NavLink>
              )}
            </div>

            {!isAuthenticated && (
              <div className="pt-4 border-t border-white/20 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white border border-white/30 rounded-full bg-white/15 hover:bg-white/25"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-extrabold text-[#A855F7] bg-white rounded-full shadow-md"
                >
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
