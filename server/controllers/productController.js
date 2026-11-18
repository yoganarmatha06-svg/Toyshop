import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary, { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

/**
 * Helper to ensure product images are stored on Cloudinary.
 * Converts local /uploads/ paths, base64 data URIs, or external URLs to Cloudinary secure URLs.
 */
const ensureCloudinaryImages = async (images) => {
  if (!Array.isArray(images) || images.length === 0) return images;
  if (!isCloudinaryConfigured()) return images;

  const processed = await Promise.all(
    images.map(async (img) => {
      if (typeof img !== 'string' || !img.trim()) return img;

      // 1. Already hosted on Cloudinary
      if (img.includes('cloudinary.com')) return img;

      // 2. Base64 data URI
      if (img.startsWith('data:image/')) {
        try {
          const cloudUrl = await uploadToCloudinary(img, 'toystore/products');
          return cloudUrl;
        } catch (err) {
          console.warn('Failed to upload base64 image to Cloudinary:', err.message);
          return img;
        }
      }

      // 3. Local /uploads/ file path
      if (img.startsWith('/uploads/')) {
        try {
          const filename = path.basename(img);
          const fullPath = path.join(uploadsDir, filename);
          if (fs.existsSync(fullPath)) {
            const cloudUrl = await uploadToCloudinary(fullPath, 'toystore/products');
            try {
              fs.unlinkSync(fullPath);
            } catch (e) {}
            return cloudUrl;
          }
        } catch (err) {
          console.warn('Failed to upload local image to Cloudinary:', err.message);
          return img;
        }
      }

      // 4. Remote HTTP/HTTPS URL -> Store URL directly in MongoDB
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img.trim();
      }

      return img;
    })
  );

  return processed;
};

// @desc    Fetch all products with filtering, searching, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const query = {};

    // Search keyword
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { brand: { $regex: req.query.keyword, $options: 'i' } },
      ];
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      // Check if category is ObjectId or slug/name
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = req.query.category;
      } else {
        const foundCat = await Category.findOne({
          $or: [
            { slug: req.query.category.toLowerCase() },
            { name: { $regex: `^${req.query.category}$`, $options: 'i' } },
          ],
        });
        if (foundCat) {
          query.category = foundCat._id;
        }
      }
    }

    // Brand filter
    if (req.query.brand && req.query.brand !== 'all') {
      query.brand = { $regex: `^${req.query.brand}$`, $options: 'i' };
    }

    // Age Group filter
    if (req.query.ageGroup && req.query.ageGroup !== 'all') {
      query.ageGroup = req.query.ageGroup;
    }

    // Availability filter
    if (req.query.inStock === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    // Featured filter
    if (req.query.featured === 'true' || req.query.isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Sorting
    let sortOption = { isFeatured: -1, createdAt: -1, updatedAt: -1 };
    if (req.query.sort === 'featured') {
      sortOption = { isFeatured: -1, createdAt: -1, updatedAt: -1 };
    } else if (req.query.sort === 'newest') {
      sortOption = { createdAt: -1, updatedAt: -1 };
    } else if (req.query.sort === 'price-low') {
      sortOption = { price: 1, createdAt: -1 };
    } else if (req.query.sort === 'price-high') {
      sortOption = { price: -1, createdAt: -1 };
    } else if (req.query.sort === 'rating') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (req.query.sort === 'popular') {
      sortOption = { numReviews: -1, rating: -1, createdAt: -1 };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon color')
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(16);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get best-selling & top rated products
// @route   GET /api/products/bestsellers
// @access  Public
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('category', 'name slug icon color')
      .sort({ rating: -1, numReviews: -1 })
      .limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug icon color description'
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Toy not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      productImages,
      category,
      brand,
      ageGroup,
      stockQuantity,
      isFeatured,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Please provide at least a toy name and category' });
    }

    const rawImages =
      Array.isArray(productImages) && productImages.length > 0
        ? productImages
        : ['/logo.png'];

    // Ensure all images are stored on Cloudinary and save Cloudinary links
    const images = await ensureCloudinaryImages(rawImages);

    const safeStock = stockQuantity !== undefined && stockQuantity !== '' ? Number(stockQuantity) : 10;

    const product = new Product({
      name,
      description: description || '',
      price: price !== undefined && price !== '' ? Number(price) : 0,
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      productImages: images,
      category,
      brand: brand || 'ToyWorld',
      ageGroup: ageGroup || '3-5 Years',
      stockQuantity: safeStock,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      availabilityStatus: safeStock > 0 ? 'In Stock' : 'Out of Stock',
    });

    const createdProduct = await product.save();
    const populated = await Product.findById(createdProduct._id).populate('category', 'name slug');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create toy' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      productImages,
      category,
      brand,
      ageGroup,
      stockQuantity,
      isFeatured,
      availabilityStatus,
    } = req.body;

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.discountPrice = discountPrice !== undefined ? Number(discountPrice) : product.discountPrice;
    if (productImages && Array.isArray(productImages) && productImages.length > 0) {
      // Ensure any newly added or updated images are uploaded to Cloudinary
      product.productImages = await ensureCloudinaryImages(productImages);
    }
    product.category = category ?? product.category;
    product.brand = brand ?? product.brand;
    product.ageGroup = ageGroup ?? product.ageGroup;
    if (stockQuantity !== undefined) {
      product.stockQuantity = Number(stockQuantity);
      product.availabilityStatus = product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
    }
    if (availabilityStatus) {
      product.availabilityStatus = availabilityStatus;
    }
    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category', 'name slug');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update toy' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Optional: Delete images from Cloudinary if stored there
      if (isCloudinaryConfigured() && Array.isArray(product.productImages)) {
        for (const imgUrl of product.productImages) {
          if (imgUrl && typeof imgUrl === 'string' && imgUrl.includes('cloudinary.com')) {
            try {
              const parts = imgUrl.split('/upload/');
              if (parts.length > 1) {
                const publicPath = parts[1].replace(/^v\d+\//, '');
                const publicId = publicPath.substring(0, publicPath.lastIndexOf('.'));
                if (publicId) await cloudinary.uploader.destroy(publicId);
              }
            } catch (cleanupErr) {
              console.warn('Could not remove product image from Cloudinary:', cleanupErr.message);
            }
          }
        }
      }

      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Toy removed successfully' });
    } else {
      res.status(404).json({ message: 'Toy not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete toy' });
  }
};

// @desc    Upload multiple product images to Cloudinary (with fallback to local storage)
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }

  try {
    // If Cloudinary is configured, upload directly to Cloudinary
    if (isCloudinaryConfigured()) {
      const uploadPromises = req.files.map(async (file) => {
        const cloudUrl = await uploadToCloudinary(file.path, 'toystore/products');
        // Delete local temporary file from disk after successful Cloudinary upload
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkErr) {
          console.warn('Could not remove temporary local file:', unlinkErr.message);
        }
        return cloudUrl;
      });

      const cloudinaryUrls = await Promise.all(uploadPromises);

      return res.json({
        message: 'Images uploaded successfully to Cloudinary! ☁️',
        imageUrls: cloudinaryUrls,
        storage: 'cloudinary',
      });
    }

    // Fallback: If Cloudinary credentials are not configured yet in .env, save to local /uploads/
    console.warn('⚠️ Cloudinary not configured in .env. Saving locally to /uploads.');
    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
    return res.json({
      message: 'Images uploaded locally (Cloudinary credentials not set in server/.env)',
      imageUrls: fileUrls,
      storage: 'local',
    });
  } catch (error) {
    console.error('Error during image upload:', error);
    // Keep local file and return local path if Cloudinary upload throws an error
    const fallbackUrls = req.files.map((file) => `/uploads/${file.filename}`);
    return res.json({
      message: 'Cloudinary upload failed, fallen back to local storage',
      imageUrls: fallbackUrls,
      storage: 'local',
      error: error.message,
    });
  }
};

// @desc    Get brands and age groups list
// @route   GET /api/products/meta/filters
// @access  Public
export const getProductFilterMeta = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    const ageGroups = ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', '12+ Years'];
    res.json({ brands, ageGroups });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

