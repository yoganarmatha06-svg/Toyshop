import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import toyLogo from '../../assets/logo.png';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e) => {
    // Only allow numbers (0-9) and limit to exactly 10 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }
    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }
    if (!phone.trim()) {
      addToast('Please enter your 10-digit phone number', 'error');
      return;
    }
    if (phone.length !== 10) {
      addToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    if (!password) {
      addToast('Please enter a password', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password, phone.trim());
      addToast('Account created successfully! Welcome aboard! 🎈', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-slate-100 shadow-xl space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={toyLogo}
            alt="Toy World"
            className="h-14 sm:h-16 w-auto mx-auto object-contain drop-shadow-sm select-none"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Join the Toy World Family
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Create an account to track shipments, rate toys, and receive surprise birthday offers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" noValidate className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Phone Number *</label>
              <span
                className={`text-[10px] font-bold ${
                  phone.length === 10
                    ? 'text-emerald-600'
                    : phone.length > 0
                    ? 'text-pink-500'
                    : 'text-slate-400'
                }`}
              >
                {phone.length}/10 digits
              </span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-wider"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Must be exactly 10 digits (numbers only)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="reg_user_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="off"
                style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px] py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-pink-600 hover:underline">
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

