import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name price discountPrice productImages stockQuantity availabilityStatus brand ageGroup',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items where product may have been deleted
    cart.items = cart.items.filter((item) => item.product !== null);

    // Calculate subtotal
    const subtotal = cart.items.reduce((acc, item) => {
      const price = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + price * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    res.json({
      cart,
      subtotal,
      totalItems,
      customerDetails: cart.customerDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Add item to cart with required user details (Name, Phone, Email, Address)
// @route   POST /api/cart
// @access  Public / Optional Auth (processes user, address and cart in database)
export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      quantity = 1,
      name,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
    } = req.body;

    // 1. Validate Product ID
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // 2. Validate Required User Details
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number (must be at least 10 digits)
    const cleanPhone = phone.trim().replace(/[\s\-+()]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    // 3. Find and Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    if (product.stockQuantity < 1) {
      return res.status(400).json({ message: 'This toy is currently out of stock' });
    }

    // 4. Process User in Database
    let userId;
    let currentUser;
    let token = null;

    if (req.user) {
      // Authenticated User
      userId = req.user._id;
      currentUser = req.user;
      currentUser.name = name.trim();
      currentUser.phone = phone.trim();
      await currentUser.save();
    } else {
      // Guest or Session User: Find existing user by email or auto-create account
      const normalizedEmail = email.toLowerCase().trim();
      currentUser = await User.findOne({ email: normalizedEmail });

      if (!currentUser) {
        // Create new user in MongoDB
        const generatedPassword = `ToyShop@${Math.floor(100000 + Math.random() * 900000)}`;
        currentUser = await User.create({
          name: name.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          password: generatedPassword,
          role: 'user',
        });
      } else {
        currentUser.name = name.trim();
        currentUser.phone = phone.trim();
        await currentUser.save();
      }

      userId = currentUser._id;
      token = generateToken(userId);
    }

    // 5. Process & Store Address in Database
    const addressDoc = await Address.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        fullName: name.trim(),
        phoneNumber: phone.trim(),
        streetAddress: address.trim(),
        city: (city && city.trim()) || 'Chennai',
        state: (state && state.trim()) || 'Tamil Nadu',
        postalCode: (postalCode && postalCode.trim()) || '600001',
        isDefault: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 6. Process & Store Cart in Database
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    cart.customerDetails = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stockQuantity) {
        return res.status(400).json({
          message: `Cannot add more than available stock (${product.stockQuantity})`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = effectivePrice;
    } else {
      if (Number(quantity) > product.stockQuantity) {
        return res.status(400).json({
          message: `Only ${product.stockQuantity} items in stock`,
        });
      }
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        price: effectivePrice,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice productImages stockQuantity availabilityStatus brand ageGroup',
    });

    const subtotal = populatedCart.items.reduce((acc, item) => {
      const p = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + p * item.quantity;
    }, 0);

    const totalItems = populatedCart.items.reduce((acc, item) => acc + item.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Product added to cart and user details saved to database successfully!',
      cart: populatedCart,
      subtotal,
      totalItems,
      customerDetails: cart.customerDetails,
      address: addressDoc,
      user: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
      },
      token: token || undefined,
    });
  } catch (error) {
    console.error('Error adding to cart with user details:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.stockQuantity) {
      return res.status(400).json({
        message: `Requested quantity exceeds available stock (${product.stockQuantity})`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice productImages stockQuantity availabilityStatus brand ageGroup',
    });

    const subtotal = populatedCart.items.reduce((acc, item) => {
      const p = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + p * item.quantity;
    }, 0);

    res.json({
      cart: populatedCart,
      subtotal,
      totalItems: populatedCart.items.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price discountPrice productImages stockQuantity availabilityStatus brand ageGroup',
    });

    const subtotal = populatedCart.items.reduce((acc, item) => {
      const p = item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
      return acc + p * item.quantity;
    }, 0);

    res.json({
      message: 'Item removed from cart',
      cart: populatedCart,
      subtotal,
      totalItems: populatedCart.items.reduce((acc, item) => acc + item.quantity, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared successfully', cart: { items: [] }, subtotal: 0, totalItems: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
