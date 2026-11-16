import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import toyLogo from '../../assets/logo.png';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password);
      if (data?.isNewUser) {
        addToast(`Welcome to Toy World, ${data.name || 'Friend'}! 🎈 Account created & signed in!`, 'success');
      } else {
        addToast(`Welcome back to Toy World, ${data?.name || 'Customer'}! 🧸`, 'success');
      }
      navigate(from, { replace: true });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@toystore.com');
    setPassword('UserPassword123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={toyLogo}
            alt="Toy World"
            className="h-16 w-auto mx-auto object-contain drop-shadow-sm select-none"
          />
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Welcome to Toy World
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to unlock exclusive toy discounts, track orders, and curate your wishlist
          </p>
        </div>

        {/* Demo Helper Button */}
        <button
          type="button"
          onClick={handleFillDemoUser}
          className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          <span>One-Click Demo Customer Login</span>
        </button>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@toystore.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In to Your Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Links */}
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3 text-xs text-slate-500">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-pink-600 hover:underline">
              Create an Account
            </Link>
          </p>

          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-amber-700 font-bold hover:underline text-[11px]"
          >
            <Shield className="w-3 h-3" /> Store Admin Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

