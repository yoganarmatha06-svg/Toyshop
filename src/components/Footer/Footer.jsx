import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';
import toyLogo from '../../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-16 pb-24 md:pb-12 border-t-4 border-pink-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-10 sm:pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-2 sm:p-0 rounded-2xl bg-slate-800/30 sm:bg-transparent">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-heading">100% Certified Safe</h4>
              <p className="text-xs text-slate-400">Non-toxic, BIS certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 sm:p-0 rounded-2xl bg-slate-800/30 sm:bg-transparent">
            <div className="w-12 h-12 rounded-2xl bg-pink-400/10 text-pink-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-heading">Lightning Fast</h4>
              <p className="text-xs text-slate-400">Free delivery on ₹999+</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 sm:p-0 rounded-2xl bg-slate-800/30 sm:bg-transparent">
            <div className="w-12 h-12 rounded-2xl bg-sky-400/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-heading">7-Day Free Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 sm:p-0 rounded-2xl bg-slate-800/30 sm:bg-transparent">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-heading">Dedicated Support</h4>
              <p className="text-xs text-slate-400">Live 24/7 care for smiles</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 py-10 sm:py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src={toyLogo}
                alt="Toy World - Play Learn Grow"
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md select-none"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bringing boundless joy, imagination, and educational discovery to childhood with India's premier collection of authentic toys, puzzles, and interactive play.
            </p>
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold">MERN Stack</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold">Razorpay Verified</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm font-heading uppercase tracking-wider mb-4 text-pink-300">
              Explore Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop?category=Soft%20Toys" className="hover:text-pink-400 transition-colors">Soft Toys & Plushes</Link></li>
              <li><Link to="/shop?category=Educational%20Toys" className="hover:text-pink-400 transition-colors">STEM & Learning Toys</Link></li>
              <li><Link to="/shop?category=Remote%20Control%20Toys" className="hover:text-pink-400 transition-colors">Remote Control Cars & Drones</Link></li>
              <li><Link to="/shop?category=Building%20Blocks" className="hover:text-pink-400 transition-colors">Building Blocks & Legos</Link></li>
              <li><Link to="/shop?category=Board%20Games" className="hover:text-pink-400 transition-colors">Family Board Games</Link></li>
              <li><Link to="/shop" className="text-pink-400 font-bold hover:underline">View All 10 Categories →</Link></li>
            </ul>
          </div>

          {/* Quick Links & Customer Care */}
          <div>
            <h4 className="text-white font-bold text-sm font-heading uppercase tracking-wider mb-4 text-pink-300">
              Customer Joy
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/my-orders" className="hover:text-pink-400 transition-colors">Track Orders</Link></li>
              <li><Link to="/cart" className="hover:text-pink-400 transition-colors">View Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-pink-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/profile" className="hover:text-pink-400 transition-colors">Shipping Addresses</Link></li>
              <li><Link to="/admin/login" className="text-amber-400 hover:underline font-semibold">Admin Portal Login</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm font-heading uppercase tracking-wider mb-4 text-pink-300">
              Reach Out
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>Sector 100, Lotus Boulevard, Noida, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>support@toyverse.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Toy World. All rights reserved. Crafted with ❤️ for curious young minds.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

