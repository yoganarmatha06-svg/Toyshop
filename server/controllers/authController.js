import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days persistent session
    path: '/',
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
    });

    if (user) {
      const token = generateToken(user._id);
      const cookieOptions = getCookieOptions();
      res.cookie('token', token, cookieOptions);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Authenticate user & get token (Auto-processes & stores new users in MongoDB)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    // If new user logs in, process in backend and store in MongoDB database!
    if (!user) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Generate a user-friendly name from email if not provided (e.g. "priya.sharma@gmail.com" -> "Priya Sharma")
      const derivedName =
        name?.trim() ||
        normalizedEmail
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      user = await User.create({
        name: derivedName || 'Toy World Customer',
        email: normalizedEmail,
        password, // pre('save') hook will hash with bcrypt
        phone: phone?.trim() || '',
        role: 'user',
      });

      const token = generateToken(user._id);
      const cookieOptions = getCookieOptions();
      res.cookie('token', token, cookieOptions);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token,
        isNewUser: true,
        message: 'Account created and logged in successfully!',
      });
    }

    // Existing user: check password
    if (await user.matchPassword(password)) {
      const token = generateToken(user._id);
      const cookieOptions = getCookieOptions();
      res.cookie('token', token, cookieOptions);
      if (user.role === 'admin') {
        res.cookie('adminToken', token, cookieOptions);
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token,
      });
    } else {
      return res.status(401).json({ message: 'Invalid password. Please check and try again.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide admin email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You do not have administrator permissions' });
    }

    if (await user.matchPassword(password)) {
      const token = generateToken(user._id);
      const cookieOptions = getCookieOptions();
      res.cookie('adminToken', token, cookieOptions);
      res.cookie('token', token, cookieOptions);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      if (req.body.avatar !== undefined) {
        user.avatar = req.body.avatar;
      }

      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email.toLowerCase() });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already taken by another account' });
        }
        user.email = req.body.email.toLowerCase();
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Upload user avatar from local disk
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo selected. Please choose a photo from your local disk.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    if (user) {
      user.avatar = avatarUrl;
      const updatedUser = await user.save();

      return res.json({
        message: 'Profile photo uploaded from disk and saved successfully! ✨',
        avatar: avatarUrl,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error uploading photo from local disk' });
  }
};

// @desc    Verify active admin session via HTTP-only cookie
// @route   GET /api/auth/verify-admin-session
// @access  Private / Admin
export const verifyAdminSession = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        authenticated: false,
        message: 'Access denied: Administrator privileges required',
      });
    }

    res.json({
      authenticated: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar: req.user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ authenticated: false, message: error.message });
  }
};

// @desc    Clear authentication cookies and terminate session
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };
    res.clearCookie('adminToken', clearOptions);
    res.clearCookie('token', clearOptions);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

