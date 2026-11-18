import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toyLogo from '../assets/logo.png';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Precise route matching: ensures ONLY ONE menu item is active at any time
  const isItemActive = (itemPath) => {
    const current = location.pathname;

    // Exact path match
    if (current === itemPath) return true;

    // Root /admin redirects to /admin/dashboard
    if (itemPath === '/admin/dashboard' && (current === '/admin' || current === '/admin/')) {
      return true;
    }

    // When editing a product, highlight "Manage Products" (and not "Add Product")
    if (itemPath === '/admin/products' && current.startsWith('/admin/products/edit')) {
      return true;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#30204F] text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 border-b border-[#442E6E]">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <img
            src={toyLogo}
            alt="Toy World Admin"
            className="h-10 w-auto object-contain select-none"
          />
          <span className="text-[10px] font-bold font-heading text-pink-300 uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#3D2963] border border-[#523884]">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-[#3D2963] text-pink-200 hover:text-white cursor-pointer transition-colors"
          aria-label="Toggle admin menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Permanently Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:z-40 w-64 h-screen bg-[#30204F] text-white flex flex-col transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 shadow-2xl md:shadow-none select-none`}
      >
        {/* Brand */}
        <div className="shrink-0 p-4 border-b border-[#442E6E] flex items-center justify-between relative">
          <Link to="/admin/dashboard" className="flex flex-col items-center mx-auto group">
            <img
              src={toyLogo}
              alt="Toy World Admin"
              className="h-16 w-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md select-none"
            />
            <span className="text-[10px] font-extrabold text-pink-300 uppercase tracking-widest flex items-center gap-1 font-heading mt-1 bg-[#3D2963] px-2.5 py-0.5 rounded-md border border-[#523884]">
              <Shield className="w-2.5 h-2.5 text-pink-300" /> Admin Control
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#E9D5FF] hover:text-white absolute top-4 right-4 p-1 rounded-lg hover:bg-[#3D2963] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer ${
                  active
                    ? 'bg-[#E84A91] text-white shadow-md shadow-[#E84A91]/30 ring-1 ring-white/10'
                    : 'text-white bg-transparent hover:bg-[#46286B] hover:text-white'
                }`}
              >
                {/* Subtle Pink Left Indicator for Active Menu */}
                {active && (
                  <span className="absolute left-1.5 top-2.5 bottom-2.5 w-1 rounded-full bg-pink-200 shadow-xs" />
                )}
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                    active
                      ? 'text-white'
                      : 'text-[#E9D5FF] group-hover:text-pink-200'
                  }`}
                />
                <span className={active ? 'ml-0.5' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Back to Store */}
        <div className="shrink-0 p-4 border-t border-[#442E6E] space-y-2.5">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#3D2963] hover:bg-[#483175] text-xs font-semibold text-[#E9D5FF] hover:text-white border border-[#523884] transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-pink-400" /> View Live Store
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#E9D5FF]" />
          </Link>

          {/* Admin profile card */}
          <div className="pt-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-[#E84A91] text-white font-black flex items-center justify-center text-xs ring-2 ring-pink-400/40 flex-shrink-0">
              A
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Admin</p>
              <p className="text-[10px] text-[#E9D5FF]/80 font-medium truncate">admin@toystore.com</p>
            </div>
          </div>

          {/* Fixed Color Sidebar Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors duration-200 cursor-pointer shadow-md shadow-rose-950/40 active:scale-98"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        <header className="hidden md:flex bg-white/95 backdrop-blur-md border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-lg font-black text-slate-800 font-heading flex items-center gap-1.5">
              <span className="font-logo text-xl text-slate-900">Toy<span className="text-pink-500 ml-0.5">World</span></span> Administration
            </h2>
            <p className="text-xs text-slate-600 font-medium">Manage toys, orders, stock, and business analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Live Store
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

