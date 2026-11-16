import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '🧸',
    },
    color: {
      type: String,
      default: '#FEE2E2',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before save
categorySchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;

