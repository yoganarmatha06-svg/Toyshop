import User from '../models/User.js';
import Address from '../models/Address.js';
import Order from '../models/Order.js';

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      houseFlatNo,
      streetAddress,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (!fullName?.trim() || !phoneNumber?.trim() || !streetAddress?.trim()) {
      return res.status(400).json({ message: 'Full name, phone, and street address are required' });
    }

    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = new Address({
      user: req.user._id,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      houseFlatNo: houseFlatNo?.trim() || '',
      streetAddress: streetAddress.trim(),
      landmark: landmark?.trim() || '',
      city: city?.trim() || '',
      state: state?.trim() || '',
      postalCode: postalCode?.trim() || '',
      country: country?.trim() || 'India',
      isDefault: Boolean(shouldBeDefault),
    });

    const saved = await address.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const {
      fullName,
      phoneNumber,
      houseFlatNo,
      streetAddress,
      landmark,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      address.isDefault = true;
    }

    if (fullName !== undefined) address.fullName = fullName.trim();
    if (phoneNumber !== undefined) address.phoneNumber = phoneNumber.trim();
    if (houseFlatNo !== undefined) address.houseFlatNo = houseFlatNo.trim();
    if (streetAddress !== undefined) address.streetAddress = streetAddress.trim();
    if (landmark !== undefined) address.landmark = landmark.trim();
    if (city !== undefined) address.city = city.trim();
    if (state !== undefined) address.state = state.trim();
    if (postalCode !== undefined) address.postalCode = postalCode.trim();
    if (country !== undefined) address.country = country.trim();

    const updated = await address.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If default was deleted, set next address as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: 'Address removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    const usersWithOrderStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u.toObject(),
          orderCount,
        };
      })
    );

    res.json(usersWithOrderStats);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user by id (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      const orderCount = await Order.countDocuments({ user: user._id });
      res.json({ ...user.toObject(), orderCount });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update user (Admin: promote/demote role, etc.)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

