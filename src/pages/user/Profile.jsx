import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Lock,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address Management
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phoneNumber: user?.phone || '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const { data } = await api.get('/users/addresses');
      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password && password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setUpdatingProfile(true);
      const payload = { name, email, phone };
      if (password) payload.password = password;

      await updateProfile(payload);
      addToast('Profile updated successfully! ✨', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/addresses', newAddr);
      addToast('New address saved!', 'success');
      setShowAddressModal(false);
      setNewAddr({
        fullName: user?.name || '',
        phoneNumber: user?.phone || '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      addToast('Address removed', 'info');
      fetchAddresses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await api.put(`/users/addresses/${id}/default`);
      addToast('Default address updated!', 'success');
      fetchAddresses();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Profile & Account Settings ⚙️
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage your personal details, login password, and delivery address book
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        {/* Profile Details Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-xs space-y-5 sm:space-y-6">
          <h2 className="text-lg font-black text-slate-900 font-heading border-b pb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-pink-500" /> Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 min-h-[44px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-pink-500" /> Change Password (Leave blank to keep current)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Address Book */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-4 sm:p-8 border border-slate-100 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-500" /> Saved Addresses ({addresses.length})
            </h2>

            <button
              onClick={() => setShowAddressModal(true)}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 min-h-[44px] flex items-center gap-1 px-2"
            >
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {loadingAddresses ? (
            <Loader text="Loading addresses..." />
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 space-y-2">
              <p>No addresses saved yet.</p>
              <button
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2.5 bg-pink-100 text-pink-700 rounded-full font-bold text-xs min-h-[44px]"
              >
                Add Your Delivery Address
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    addr.isDefault
                      ? 'border-pink-300 bg-pink-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black rounded-md uppercase">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                        📞 {addr.phoneNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          className="text-[11px] font-bold text-pink-600 hover:underline min-h-[44px] px-2 flex items-center"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-slate-400 hover:text-rose-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete address"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Address Form Modal */}
          {showAddressModal && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-900 font-heading uppercase tracking-wider">
                New Address
              </h3>
              <form onSubmit={handleCreateAddress} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newAddr.phoneNumber}
                    onChange={(e) => setNewAddr({ ...newAddr, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street address, house no..."
                  value={newAddr.streetAddress}
                  onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl min-h-[44px]"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-pink-500 text-white rounded-full text-xs font-bold min-h-[44px]"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2.5 text-xs text-slate-500 font-bold min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

