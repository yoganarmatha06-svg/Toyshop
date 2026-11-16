import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Route Guards
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

// User Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetails from './pages/user/ProductDetails';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import Checkout from './pages/user/Checkout';
import MyOrders from './pages/user/MyOrders';
import Profile from './pages/user/Profile';
import Login from './pages/user/Login';
import Register from './pages/user/Register';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ManageCategories from './pages/admin/ManageCategories';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import SalesReports from './pages/admin/SalesReports';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Public & Customer Routes */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin Login (Dedicated Standalone) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<SalesReports />} />
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
  );
}

export default App;

