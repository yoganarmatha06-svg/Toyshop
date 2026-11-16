import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      min: [0, 'Price must be positive'],
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    productImages: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A product must have at least one image',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'ToyWorld',
    },
    ageGroup: {
      type: String,
      enum: ['0-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', '12+ Years', 'All Ages'],
      default: '3-5 Years',
    },
    stockQuantity: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Pre-order'],
      default: 'In Stock',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Automatic availability update before save
productSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.availabilityStatus = 'Out of Stock';
  } else if (this.availabilityStatus === 'Out of Stock' && this.stockQuantity > 0) {
    this.availabilityStatus = 'In Stock';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;

