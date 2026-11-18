import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary using either individual environment variables or CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Check if valid Cloudinary credentials have been provided in environment variables
 */
export const isCloudinaryConfigured = () => {
  if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.trim()) {
    return true;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const isPlaceholder = (val) =>
    !val ||
    val.includes('your_') ||
    val.trim() === '';

  return !isPlaceholder(cloudName) && !isPlaceholder(apiKey) && !isPlaceholder(apiSecret);
};

/**
 * Upload a file, local path, or base64 data URI to Cloudinary
 * @param {string} fileSource - Local filepath, remote URL, or base64 data URI
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<string>} Secure HTTPS Cloudinary URL
 */
export const uploadToCloudinary = async (fileSource, folder = 'toystore/products') => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured in server/.env');
  }

  const result = await cloudinary.uploader.upload(fileSource, {
    folder,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }, // Automatic image compression & format optimization
    ],
  });

  return result.secure_url;
};

export default cloudinary;
