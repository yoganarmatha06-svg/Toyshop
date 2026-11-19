/**
 * Resolves local or remote category image paths to an absolute or accessible URL.
 */
export const resolveCategoryImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '';
  const trimmed = image.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (import.meta.env.DEV) {
    return cleanPath;
  }

  // In production, attach backend host if relative
  const apiBase = (import.meta.env.VITE_API_URL || 'https://toyshop-6xha.onrender.com')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');
  return `${apiBase}${cleanPath}`;
};

/**
 * Returns the dynamic category image stored in MongoDB.
 * Priority:
 * 1. category.image from the database (Cloudinary, local /uploads/, or external URL)
 * 2. High-quality default toy placeholder if no image is uploaded
 */
export const getCategoryImage = (category) => {
  if (!category) return null;

  // 1. Primary: Use the actual image stored in MongoDB database
  if (category.image && typeof category.image === 'string' && category.image.trim() !== '') {
    return {
      src: resolveCategoryImageUrl(category.image),
      alt: category.name || 'Category',
      fit: 'cover',
      hasCustomImage: true,
    };
  }

  // 2. Fallback: High-quality default toy image (no emoji icons as images)
  return {
    src: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    alt: category.name || 'Category',
    fit: 'cover',
    hasCustomImage: false,
  };
};

