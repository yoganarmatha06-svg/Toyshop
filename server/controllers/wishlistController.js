import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist.products || []);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Toggle item in wishlist (Add/Remove)
// @route   POST /api/wishlist/:productId
// @access  Private
export const toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (id) => (id._id || id).toString() === productId.toString()
    );
    let added = false;

    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    // Deduplicate
    wishlist.products = Array.from(
      new Set(wishlist.products.map((id) => (id._id || id).toString()))
    );

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' },
    });

    res.json({
      message: added ? 'Added to wishlist' : 'Removed from wishlist',
      added,
      products: populated.products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.json([]);
    }

    wishlist.products = wishlist.products.filter(
      (id) => (id._id || id).toString() !== productId.toString()
    );
    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'category', select: 'name slug' },
    });

    res.json({
      message: 'Removed from wishlist',
      products: populated.products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

