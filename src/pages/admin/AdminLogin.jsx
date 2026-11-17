import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import toyLogo from '../../assets/logo.png';
import Loader from '../../components/Loader/Loader';

const AdminLogin = () => {
  const { adminLogin, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already authenticated as Admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminLogin(email, password);
      addToast('Welcome to the Admin Portal! 🛡️', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@toystore.com');
    setPassword('AdminPassword123!');
  };

  if (authLoading) {
    return <Loader fullScreen text="Checking existing admin session..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 sm:p-10 border border-slate-700 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src={toyLogo}
            alt="Toy World Admin"
            className="h-20 w-auto mx-auto object-contain drop-shadow-xl select-none"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold font-heading">
            <Shield className="w-3.5 h-3.5" /> Admin Control Portal
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Restricted store management, stock monitoring, and orders panel
          </p>
        </div>

        {/* Demo Helper Button */}
        <button
          type="button"
          onClick={handleFillDemoAdmin}
          className="w-full py-2.5 px-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400/20 transition-colors flex items-center justify-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>One-Click Fill Admin Credentials</span>
        </button>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@toystore.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Enter Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Back to Public Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

