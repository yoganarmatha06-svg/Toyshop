import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  HardDrive,
  Loader2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Loader from '../../components/Loader/Loader';

const PRESET_AVATARS = [
  { name: 'Teddy 🧸', url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=250&q=80' },
  { name: 'Robot 🤖', url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=250&q=80' },
  { name: 'Unicorn 🦄', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=250&q=80' },
  { name: 'Doll 👧', url: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=250&q=80' },
  { name: 'Racer 🏎️', url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=250&q=80' },
  { name: 'Panda 🐼', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=250&q=80' },
];

const Profile = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

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
      // If avatar is the default stock woman photo, reset to empty so user sees placeholder
      const currentAvatar = (user.avatar && !user.avatar.includes('photo-1534528741775-53994a69daeb')) ? user.avatar : '';
      setAvatar(currentAvatar);
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      addToast('Image size should be less than 20MB', 'error');
      return;
    }

    try {
      setUploadingPhoto(true);
      // Immediately preview local file on screen
      const localPreviewUrl = URL.createObjectURL(file);
      setAvatar(localPreviewUrl);

      // Upload directly to server local disk via Multer endpoint
      const result = await uploadAvatar(file);
      setAvatar(result.avatar);
      addToast('Photo uploaded from local disk and saved! ✨', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to upload photo from disk', 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      const payload = { name, email, phone, avatar };
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
            {/* Avatar Upload / Selector */}
            <div className="bg-gradient-to-br from-pink-50/80 via-purple-50/50 to-white p-4 sm:p-5 rounded-2xl border border-pink-100/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-pink-500" /> Profile Photo
                </label>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar('');
                      addToast('Photo removed. Click "Save Profile Changes" to confirm.', 'info');
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Preview / Click to upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer flex-shrink-0"
                  title="Click to choose a photo from device"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-300 shadow-md group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-pink-200 shadow-md">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5">Upload</span>
                  </div>

                  <span className="absolute bottom-0 right-0 p-1.5 bg-pink-500 text-white rounded-full shadow-md ring-2 ring-white">
                    <Camera className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Upload Button & Actions */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      disabled={uploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading from Disk...
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3.5 h-3.5" /> Upload from Local Disk
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500" /> Image Link
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Choose any photo from your local disk (C:\, D:\, Pictures, Downloads, etc.) or mobile gallery.
                  </p>
                </div>
              </div>

              {/* Optional Image URL Input */}
              {showUrlInput && (
                <div className="pt-2">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Paste image URL (e.g. https://...)"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-400"
                  />
                </div>
              )}

              {/* Preset Toy Character Avatars */}
              <div className="pt-3 border-t border-pink-100">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or pick a fun toy avatar:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        addToast(`Selected ${preset.name} avatar! Click Save to apply.`, 'info');
                      }}
                      className={`relative flex-shrink-0 p-1 rounded-full border-2 transition-all cursor-pointer hover:scale-110 ${
                        avatar === preset.url
                          ? 'border-pink-500 ring-2 ring-pink-300 scale-105'
                          : 'border-transparent hover:border-pink-300'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400"
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

