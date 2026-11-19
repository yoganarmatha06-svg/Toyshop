/**
 * Utility functions for cleaning, resolving and parsing product and category image URLs.
 */

export const FALLBACK_TOY_IMAGE =
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80';

/**
 * Cleans an image URL:
 * - Trims whitespace
 * - Strips accidental wrapping quotes ("...", '...')
 * - Extracts direct image URLs from Google Images search links (/imgres?imgurl=... or /url?q=...)
 * - Converts Google Drive view links to direct view URLs
 * - Converts Dropbox dl=0 links to raw=1
 * - Auto-prepends https: if missing
 */
export const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let cleaned = url.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return '';

  // Base64 Data URLs and blob URLs
  if (cleaned.startsWith('data:') || cleaned.startsWith('blob:')) {
    return cleaned;
  }

  // Extract real image from Google Image search URLs
  try {
    if (cleaned.includes('google.') && (cleaned.includes('/imgres') || cleaned.includes('/url'))) {
      const urlObj = new URL(cleaned);
      const real =
        urlObj.searchParams.get('imgurl') ||
        urlObj.searchParams.get('url') ||
        urlObj.searchParams.get('q');
      if (real) {
        cleaned = decodeURIComponent(real);
      }
    }
  } catch (e) {
    // Keep original if URL parsing fails
  }

  // Google Drive
  if (cleaned.includes('drive.google.com/file/d/')) {
    const match = cleaned.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      cleaned = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  // Dropbox
  if (cleaned.includes('dropbox.com') && cleaned.includes('dl=0')) {
    cleaned = cleaned.replace('dl=0', 'raw=1');
  }

  // Protocol completion
  if (cleaned.startsWith('//')) {
    cleaned = 'https:' + cleaned;
  } else if (cleaned.startsWith('www.')) {
    cleaned = 'https://' + cleaned;
  }

  // Remove trailing commas, semicolons, or closing parens from copy-paste
  cleaned = cleaned.replace(/[,\);]+$/, '');

  return cleaned;
};

/**
 * Parses user input for one or multiple image URLs.
 * IMPORTANT: Does NOT split on commas alone, because Cloudinary URLs and Base64 Data URLs contain commas!
 */
export const parseImageUrls = (input) => {
  if (!input || typeof input !== 'string') return [];
  const trimmed = input.trim();
  if (!trimmed) return [];

  // 1. Data URLs should never be split
  if (trimmed.startsWith('data:image/')) {
    return [trimmed];
  }

  // 2. If it contains multiple http/https URLs, extract them with regex
  const httpMatches = trimmed.match(/https?:\/\/[^\s"'\n\r]+/gi);
  if (httpMatches && httpMatches.length > 0) {
    return httpMatches.map(cleanImageUrl).filter(Boolean);
  }

  // 3. Otherwise, split by newlines only
  return trimmed
    .split(/\r?\n/)
    .map((line) => cleanImageUrl(line))
    .filter(Boolean);
};

/**
 * Resolves a product image URL to a safe, displayable link.
 */
export const resolveProductImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '/logo.png';
  const cleaned = cleanImageUrl(image);
  if (!cleaned) return '/logo.png';

  if (
    cleaned.startsWith('http://') ||
    cleaned.startsWith('https://') ||
    cleaned.startsWith('data:') ||
    cleaned.startsWith('blob:')
  ) {
    return cleaned;
  }

  const cleanPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  if (import.meta.env.DEV) {
    return cleanPath;
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'https://toyshop-6xha.onrender.com')
    .replace(/\/api\/?$/, '')
    .replace(/\/+$/, '');
  return `${apiBase}${cleanPath}`;
};
