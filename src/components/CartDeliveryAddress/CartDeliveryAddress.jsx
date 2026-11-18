import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Home,
  Building,
  Phone,
  User,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const initialFormState = {
  fullName: '',
  phoneNumber: '',
  houseFlatNo: '',
  streetAddress: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: '',
  isDefault: false,
};

const CartDeliveryAddress = ({
  selectedAddressId,
  onSelectAddress,
  onAddressesChange,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch addresses on mount / user change
  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/addresses');
      const addressList = Array.isArray(data) ? data : [];
      setAddresses(addressList);

      if (onAddressesChange) {
        onAddressesChange(addressList);
      }

      // Automatically select default address or first address if none selected yet
      if (addressList.length > 0) {
        const currentlySelected = addressList.find((a) => a._id === selectedAddressId);
        if (!currentlySelected) {
          const defaultAddr = addressList.find((a) => a.isDefault) || addressList[0];
          onSelectAddress(defaultAddr._id, defaultAddr);
        } else {
          onSelectAddress(currentlySelected._id, currentlySelected);
        }
      } else {
        onSelectAddress(null, null);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      addToast(err.message || 'Failed to load delivery addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open Form for Adding New Address
  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setFormData({
      fullName: user?.name || '',
      phoneNumber: user?.phone || '',
      houseFlatNo: '',
      streetAddress: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: addresses.length === 0, // First address is default automatically
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Address
  const handleOpenEditForm = (addr, e) => {
    e.stopPropagation();
    setEditingAddressId(addr._id);
    setFormData({
      fullName: addr.fullName || '',
      phoneNumber: addr.phoneNumber || '',
      houseFlatNo: addr.houseFlatNo || '',
      streetAddress: addr.streetAddress || '',
      landmark: addr.landmark || '',
      city: addr.city === 'Chennai' ? '' : (addr.city || ''),
      state: addr.state === 'Tamil Nadu' ? '' : (addr.state || ''),
      postalCode: addr.postalCode === '600001' ? '' : (addr.postalCode || ''),
      isDefault: Boolean(addr.isDefault),
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Close Form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddressId(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phoneNumber.replace(/[\s\-+()]/g, '');
    if (!cleanPhone) {
      errors.phoneNumber = 'Mobile Number is required';
    } else if (cleanPhone.length < 10) {
      errors.phoneNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.streetAddress.trim()) {
      errors.streetAddress = 'Street / Area is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Save Address (Create or Update in MongoDB)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please fill all required address fields correctly', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        houseFlatNo: formData.houseFlatNo.trim(),
        streetAddress: formData.streetAddress.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        isDefault: Boolean(formData.isDefault),
      };

      if (editingAddressId) {
        // Update existing address
        const { data: updated } = await api.put(`/users/addresses/${editingAddressId}`, payload);
        addToast('Delivery address updated successfully! ✨', 'success');

        const updatedList = addresses.map((a) => {
          if (a._id === editingAddressId) return updated;
          if (payload.isDefault) return { ...a, isDefault: false };
          return a;
        });

        setAddresses(updatedList);
        if (onAddressesChange) onAddressesChange(updatedList);
        if (selectedAddressId === editingAddressId) {
          onSelectAddress(updated._id, updated);
        }
      } else {
        // Create new address
        const { data: created } = await api.post('/users/addresses', payload);
        addToast('New delivery address saved successfully! 📍', 'success');

        let updatedList;
        if (payload.isDefault) {
          updatedList = [created, ...addresses.map((a) => ({ ...a, isDefault: false }))];
        } else {
          updatedList = [...addresses, created];
        }

        setAddresses(updatedList);
        if (onAddressesChange) onAddressesChange(updatedList);
        // Automatically select the newly created address
        onSelectAddress(created._id, created);
      }

      handleCloseForm();
    } catch (err) {
      console.error('Save address error:', err);
      addToast(err.message || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Address from MongoDB
  const handleDeleteAddress = async (addressId, e) => {
    e.stopPropagation();
    const target = addresses.find((a) => a._id === addressId);
    if (!window.confirm(`Are you sure you want to delete this address (${target?.fullName || 'Selected'})?`)) {
      return;
    }

    try {
      setDeletingId(addressId);
      await api.delete(`/users/addresses/${addressId}`);
      addToast('Address deleted successfully', 'info');

      const remaining = addresses.filter((a) => a._id !== addressId);
      setAddresses(remaining);
      if (onAddressesChange) onAddressesChange(remaining);

      // If deleted address was selected, select default or first remaining address
      if (selectedAddressId === addressId) {
        if (remaining.length > 0) {
          const nextSelected = remaining.find((a) => a.isDefault) || remaining[0];
          onSelectAddress(nextSelected._id, nextSelected);
        } else {
          onSelectAddress(null, null);
        }
      }
    } catch (err) {
      console.error('Delete address error:', err);
      addToast(err.message || 'Failed to delete address', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Set Address as Default in MongoDB
  const handleSetDefaultAddress = async (addressId, e) => {
    e.stopPropagation();
    try {
      const { data: updated } = await api.put(`/users/addresses/${addressId}/default`);
      addToast('Default delivery address updated! ⭐', 'success');

      const updatedList = addresses.map((a) => ({
        ...a,
        isDefault: a._id === addressId,
      }));
      setAddresses(updatedList);
      if (onAddressesChange) onAddressesChange(updatedList);
    } catch (err) {
      console.error('Set default address error:', err);
      addToast(err.message || 'Failed to set default address', 'error');
    }
  };

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-black shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-heading flex items-center gap-2">
              <span>Delivery Address</span>
              {addresses.length > 0 && (
                <span className="text-[10px] font-bold text-black bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                  {addresses.length} Saved
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Select or add your delivery location for this order
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Address</span>
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-28 rounded-xl bg-slate-100 animate-pulse hidden md:block" />
        </div>
      ) : addresses.length === 0 && !isFormOpen ? (
        /* Empty State */
        <div className="text-center py-5 px-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 mx-auto flex items-center justify-center">
            <Home className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 font-heading">
              No delivery address saved yet
            </h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              Please enter your full address so we know exactly where to deliver your toys!
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-black hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Delivery Address</span>
          </button>
        </div>
      ) : (
        /* Address Cards Grid (Multiple Address Management) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr._id;

              return (
                <div
                  key={addr._id}
                  onClick={() => onSelectAddress(addr._id, addr)}
                  className={`relative p-3 sm:p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-sm ring-1 ring-black/15'
                      : 'border-slate-300 hover:border-black bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Top Row: Radio + Name + Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="deliveryAddressSelection"
                          checked={isSelected}
                          onChange={() => onSelectAddress(addr._id, addr)}
                          className="w-3.5 h-3.5 text-black accent-black cursor-pointer flex-shrink-0"
                          aria-label={`Select ${addr.fullName}'s address`}
                        />
                        <span className="font-black text-slate-900 font-heading text-xs sm:text-sm truncate">
                          {addr.fullName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            Default
                          </span>
                        )}
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-black text-white">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                            Delivering Here
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address Content */}
                    <div className="pl-5 text-xs text-slate-600 space-y-0.5 leading-snug">
                      <p className="font-medium text-slate-700">
                        <span className="text-slate-400">Phone: </span>
                        <strong className="text-slate-900 font-bold">{addr.phoneNumber}</strong>
                      </p>

                      <p className="text-slate-700">
                        {addr.houseFlatNo && (
                          <strong className="text-slate-900 font-semibold">{addr.houseFlatNo}, </strong>
                        )}
                        {addr.streetAddress}
                      </p>

                      {addr.landmark && (
                        <p className="text-[11px] text-slate-700 font-medium">
                          <span className="text-slate-400">Landmark: </span>
                          {addr.landmark}
                        </p>
                      )}

                      {(addr.city || addr.state || addr.postalCode) && (
                        <p className="font-semibold text-slate-800">
                          {[addr.city, addr.state].filter(Boolean).join(', ')}
                          {addr.postalCode ? `${[addr.city, addr.state].filter(Boolean).length > 0 ? ' - ' : ''}${addr.postalCode}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between pl-5 text-[11px]">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditForm(addr, e)}
                        className="inline-flex items-center gap-1 font-bold text-slate-800 hover:text-black hover:underline cursor-pointer"
                        title="Edit Address Details"
                      >
                        <Edit2 className="w-3 h-3 text-slate-700" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === addr._id}
                        onClick={(e) => handleDeleteAddress(addr._id, e)}
                        className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-rose-600 hover:underline cursor-pointer disabled:opacity-50"
                        title="Delete Address"
                      >
                        {deletingId === addr._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleSetDefaultAddress(addr._id, e)}
                        className="text-[11px] font-bold text-slate-600 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-slate-600" />
                        <span>Set as Default</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Address Form (Add New Address / Edit Address) */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveAddress}
          className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border-2 border-black shadow-md space-y-3 transition-all"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-heading flex items-center gap-2">
                <MapPin className="w-4 h-4 text-black" />
                <span>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                All fields marked with an asterisk (*) are mandatory for smooth delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close address form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-800" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 min-h-[42px] ${
                  formErrors.fullName
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-black'
                }`}
              />
              {formErrors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-800" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number e.g. 9876543210"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 min-h-[42px] ${
                  formErrors.phoneNumber
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-black'
                }`}
              />
              {formErrors.phoneNumber && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* House / Flat Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-800" />
                <span>House / Flat Number *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Building A / Door No. 12"
                value={formData.houseFlatNo}
                onChange={(e) => setFormData({ ...formData, houseFlatNo: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 min-h-[42px] ${
                  formErrors.houseFlatNo
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-black'
                }`}
              />
              {formErrors.houseFlatNo && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.houseFlatNo}
                </p>
              )}
            </div>

            {/* Street / Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Home className="w-3 h-3 text-slate-800" />
                <span>Street / Area *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Gandhi Street, Anna Nagar"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 min-h-[42px] ${
                  formErrors.streetAddress
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-black'
                }`}
              />
              {formErrors.streetAddress && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.streetAddress}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Landmark (optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Landmark <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Near City Park / Opp. Water Tank"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[42px]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="Enter city name"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[42px]"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="Enter state name"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[42px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                placeholder="Enter pincode"
                maxLength={10}
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black min-h-[42px]"
              />
            </div>

            {/* Default Checkbox */}
            <div className="pt-2 sm:pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-black rounded-md border-slate-300 focus:ring-black accent-black cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Set as Default Delivery Address</span>
              </label>
            </div>
          </div>

          {/* Form Actions: Save Address & Cancel */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-black hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[40px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                <span>Save Address</span>
              )}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={handleCloseForm}
              className="px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer min-h-[40px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default CartDeliveryAddress;
