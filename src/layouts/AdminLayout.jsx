import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Eye,
  Shield,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toyLogo from '../assets/logo.png';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Products', path: '/admin/products', icon: Package },
    { name: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Sales Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  // Helper to determine active page title
  const getPageTitle = () => {
    const current = location.pathname;
    if (current.includes('/admin/products/add')) return 'Add New Toy';
    if (current.includes('/admin/products/edit')) return 'Edit Toy Details';
    if (current.includes('/admin/products')) return 'Manage Toy Inventory';
    if (current.includes('/admin/categories')) return 'Toy Categories';
    if (current.includes('/admin/orders')) return 'Customer Orders';
    if (current.includes('/admin/users')) return 'Users & Customers';
    if (current.includes('/admin/reports')) return 'Sales Reports & Analytics';
    return 'Store Dashboard';
  };

  const isItemActive = (itemPath) => {
    const current = location.pathname;
    if (current === itemPath) return true;
    if (itemPath === '/admin/dashboard' && (current === '/admin' || current === '/admin/')) {
      return true;
    }
    if (itemPath === '/admin/products' && current.startsWith('/admin/products/edit')) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
      {/* Mobile & Tablet Header (< lg) */}
      <header className="lg:hidden bg-[#30204F] text-white px-3.5 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-40 border-b border-[#442E6E] shadow-sm select-none">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-xl bg-[#3D2963] text-pink-200 hover:text-white active:scale-95 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Toggle admin navigation menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin/dashboard" className="flex items-center gap-2 truncate">
            <img
              src={toyLogo}
              alt="Toy World Admin"
              className="h-8 sm:h-9 w-auto object-contain select-none shrink-0"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs sm:text-sm font-black font-heading text-white truncate">
                Toy<span className="text-pink-400">World</span>
              </span>
              <span className="text-[9px] font-bold text-pink-300 font-heading truncate">
                {getPageTitle()}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Icons on Mobile */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="w-9 h-9 rounded-xl bg-[#3D2963] hover:bg-[#4a3278] text-[#E9D5FF] hover:text-white flex items-center justify-center transition-colors"
            title="View Live Store"
          >
            <Eye className="w-4 h-4 text-pink-400" />
          </Link>

          {/* Admin Avatar Chip */}
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black flex items-center justify-center text-xs shadow-xs ring-1 ring-pink-400/30 shrink-0"
            title={user?.email || 'Admin'}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Dark Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Slide-in Drawer on Mobile/Tablet (< lg) & Permanently Fixed on Desktop (>= lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:z-30 w-64 sm:w-72 lg:w-64 max-w-[85vw] h-screen bg-[#30204F] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 shadow-2xl lg:shadow-none select-none`}
      >
        {/* Brand Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-[#442E6E] flex items-center justify-between relative">
          <Link
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex flex-col items-center mx-auto group cursor-pointer"
          >
            <img
              src={toyLogo}
              alt="Toy World Admin"
              className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md select-none"
            />
            <span className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest flex items-center gap-1 font-heading mt-1 bg-[#3D2963] px-2.5 py-0.5 rounded-md border border-[#523884]">
              <Shield className="w-2.5 h-2.5 text-pink-300" /> Admin Control
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#E9D5FF] hover:text-white absolute top-4 right-4 p-1.5 rounded-xl hover:bg-[#3D2963] transition-colors cursor-pointer"
            aria-label="Close sidebar drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 sm:p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer min-h-[44px] ${
                  active
                    ? 'bg-[#E84A91] text-white shadow-md shadow-[#E84A91]/30 ring-1 ring-white/10'
                    : 'text-white bg-transparent hover:bg-[#46286B] hover:text-white'
                }`}
              >
                {active && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-pink-200 shadow-xs" />
                )}
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                    active ? 'text-white' : 'text-[#E9D5FF] group-hover:text-pink-200'
                  }`}
                />
                <span className={active ? 'ml-0.5' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Back to Store & User Profile */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#442E6E] space-y-2.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#3D2963] hover:bg-[#483175] text-xs font-semibold text-[#E9D5FF] hover:text-white border border-[#523884] transition-all duration-300 min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-pink-400" /> View Live Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#E9D5FF]" />
          </Link>

          {/* Admin profile card */}
          <div className="pt-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-[#E84A91] text-white font-black flex items-center justify-center text-xs ring-2 ring-pink-400/40 flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#E9D5FF]/80 font-medium truncate">
                {user?.email || 'admin@toystore.com'}
              </p>
            </div>
          </div>

          {/* Fixed Color Sidebar Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors duration-200 cursor-pointer shadow-md shadow-rose-950/40 active:scale-98 min-h-[42px]"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Desktop Header (>= lg) */}
        <header className="hidden lg:flex bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div>
            <h2 className="text-lg font-black text-slate-800 font-heading flex items-center gap-1.5">
              <span className="font-logo text-xl text-slate-900">
                Toy<span className="text-pink-500 ml-0.5">World</span>
              </span>{' '}
              Administration
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {getPageTitle()} • Manage inventory, orders, stock, and reports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors border border-pink-200/70"
            >
              <Eye className="w-3.5 h-3.5" /> View Live Store
            </Link>

            {/* Admin status pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black flex items-center justify-center text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Admin'}</p>
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Session
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet with Responsive Padding & Zero Horizontal Overflow */}
        <main className="p-3 sm:p-5 md:p-6 lg:p-8 flex-1 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
