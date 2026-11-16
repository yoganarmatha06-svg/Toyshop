import Review from '../models/Review.js';
import Product from '../models/Product.js';

// Recalculate average rating & review count helper
const updateProductRatingStats = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? Math.round(
          (reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews) * 10
        ) / 10
      : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create or update product review
// @route   POST /api/reviews/product/:productId
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const { productId } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Toy not found' });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      alreadyReviewed.title = title || '';
      await alreadyReviewed.save();

      await updateProductRatingStats(productId);

      const populated = await Review.findById(alreadyReviewed._id).populate('user', 'name avatar');
      return res.json({ message: 'Review updated successfully', review: populated });
    }

    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      title: title || '',
    });

    const savedReview = await review.save();
    await updateProductRatingStats(productId);

    const populated = await Review.findById(savedReview._id).populate('user', 'name avatar');
    res.status(201).json({ message: 'Review added successfully', review: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email avatar')
      .populate('product', 'name productImages price')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRatingStats(productId);

    res.json({ message: 'Review removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

