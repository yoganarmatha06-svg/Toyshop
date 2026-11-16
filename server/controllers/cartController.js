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

    // Populate customerDetails from Address if missing in cart
    let customerDetails = cart.customerDetails;
    if (!customerDetails || !customerDetails.address) {
      const userAddr = await Address.findOne({ user: req.user._id });
      if (userAddr) {
        customerDetails = {
          name: userAddr.fullName || req.user.name,
          phone: userAddr.phoneNumber || req.user.phone,
          email: req.user.email,
          address: userAddr.streetAddress,
          city: userAddr.city,
          postalCode: userAddr.postalCode,
        };
        cart.customerDetails = customerDetails;
        await cart.save();
      }
    }

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
      customerDetails: cart.customerDetails || customerDetails,
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

    // 2. Find and Validate Product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    if (product.stockQuantity < 1) {
      return res.status(400).json({ message: 'This toy is currently out of stock' });
    }

    // 3. Resolve User and Existing Details (Allows 1-time collection)
    let finalName = name?.trim();
    let finalPhone = phone?.trim();
    let finalEmail = email?.trim()?.toLowerCase();
    let finalAddress = address?.trim();
    let finalCity = city?.trim();
    let finalState = state?.trim();
    let finalPostalCode = postalCode?.trim();

    let currentUser = req.user || null;
    let userId = currentUser ? currentUser._id : null;
    let token = null;

    // If user is already authenticated or has an active session
    if (currentUser) {
      if (!finalName) finalName = currentUser.name;
      if (!finalPhone) finalPhone = currentUser.phone;
      if (!finalEmail) finalEmail = currentUser.email?.toLowerCase();

      // Look up existing address in DB if not provided in payload
      const existingAddress = await Address.findOne({ user: userId });
      if (existingAddress) {
        if (!finalAddress) finalAddress = existingAddress.streetAddress;
        if (!finalCity) finalCity = existingAddress.city;
        if (!finalState) finalState = existingAddress.state;
        if (!finalPostalCode) finalPostalCode = existingAddress.postalCode;
        if (!finalPhone) finalPhone = existingAddress.phoneNumber;
      }

      // Check existing cart's saved customerDetails if still missing
      if (!finalAddress || !finalPhone) {
        const existingCart = await Cart.findOne({ user: userId });
        if (existingCart?.customerDetails) {
          if (!finalPhone && existingCart.customerDetails.phone) finalPhone = existingCart.customerDetails.phone;
          if (!finalAddress && existingCart.customerDetails.address) finalAddress = existingCart.customerDetails.address;
          if (!finalName && existingCart.customerDetails.name) finalName = existingCart.customerDetails.name;
          if (!finalEmail && existingCart.customerDetails.email) finalEmail = existingCart.customerDetails.email;
        }
      }

      // Fallback defaults for authenticated users so subsequent adds to cart never fail
      if (!finalPhone) finalPhone = currentUser.phone || '9876543210';
      if (!finalAddress) finalAddress = 'Customer Delivery Address';
      if (!finalCity) finalCity = 'Chennai';
      if (!finalState) finalState = 'Tamil Nadu';
      if (!finalPostalCode) finalPostalCode = '600001';
    }

    // 4. Validate Required User Details (Required on 1st time for new/guest users)
    if (!currentUser) {
      if (!finalName) {
        return res.status(400).json({ requiresDetails: true, message: 'Full name is required' });
      }

      if (!finalPhone) {
        return res.status(400).json({ requiresDetails: true, message: 'Phone number is required' });
      }

      // Validate phone number (must be at least 10 digits)
      const cleanPhone = finalPhone.replace(/[\s\-+()]/g, '');
      if (cleanPhone.length < 10) {
        return res.status(400).json({ requiresDetails: true, message: 'Please enter a valid 10-digit phone number' });
      }

      if (!finalEmail) {
        return res.status(400).json({ requiresDetails: true, message: 'Email address is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        return res.status(400).json({ requiresDetails: true, message: 'Please enter a valid email address' });
      }

      if (!finalAddress) {
        return res.status(400).json({ requiresDetails: true, message: 'Delivery address is required' });
      }
    }

    // 5. Process User in Database
    if (currentUser) {
      // Update phone or name if newer values provided
      if (name && name.trim()) currentUser.name = finalName;
      if (phone && phone.trim()) currentUser.phone = finalPhone;
      await currentUser.save();
    } else {
      // Guest or Session User: Find existing user by email or auto-create account
      currentUser = await User.findOne({ email: finalEmail });

      if (!currentUser) {
        // Create new user in MongoDB
        const generatedPassword = `ToyShop@${Math.floor(100000 + Math.random() * 900000)}`;
        currentUser = await User.create({
          name: finalName,
          email: finalEmail,
          phone: finalPhone,
          password: generatedPassword,
          role: 'user',
        });
      } else {
        currentUser.name = finalName;
        currentUser.phone = finalPhone;
        await currentUser.save();
      }

      userId = currentUser._id;
      token = generateToken(userId);
    }

    // 6. Process & Store Address in Database
    const addressDoc = await Address.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        fullName: finalName,
        phoneNumber: finalPhone,
        streetAddress: finalAddress,
        city: finalCity || 'Chennai',
        state: finalState || 'Tamil Nadu',
        postalCode: finalPostalCode || '600001',
        isDefault: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 7. Process & Store Cart in Database
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    cart.customerDetails = {
      name: finalName,
      phone: finalPhone,
      email: finalEmail,
      address: finalAddress,
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
