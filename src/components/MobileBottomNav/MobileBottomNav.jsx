import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const MobileBottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  // Don't render on admin dashboard pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Shop Toys',
      path: '/shop',
      icon: LayoutGrid,
    },
    {
      name: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : null,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
      badgeColor: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
    },
    {
      name: isAuthenticated ? (user?.name?.split(' ')[0] || 'Account') : 'Account',
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
      hasAvatar: false,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-1 py-1 safe-area-bottom"
    >
      <div className="grid grid-cols-5 items-center justify-around h-14 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#A855F7] font-black'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.hasAvatar ? (
                  <img
                    src={item.avatarUrl}
                    alt={user?.name || 'Account'}
                    className={`w-5 h-5 rounded-full object-cover transition-transform ${
                      isActive ? 'ring-2 ring-[#A855F7] scale-110' : 'ring-1 ring-slate-300'
                    }`}
                  />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive
                        ? 'scale-110 stroke-[2.5px] text-[#A855F7]'
                        : 'stroke-[1.8px]'
                    }`}
                  />
                )}

                {/* Notification Badge for Cart and Wishlist */}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-xs ${item.badgeColor}`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[62px]">
                {item.name}
              </span>

              {/* Active Tab Dot Indicator */}
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
